import WebSocket from 'ws';
import debug from 'debug';
import MessageModel from '../models/message';
import { Message, OnlineUsers } from '../types';
import { IncomingMessage } from 'http';

const PORT = process.env.PORT || 4000;
const SecureWebSocket = new WebSocket.Server({ port: PORT as number });
const onlineUsers: OnlineUsers = {};

const handleConnection = (websocket: any, req: IncomingMessage) => {
  const uid: string = req.url?.replace('/?user=', '') as string;
  websocket.uid = uid;
  onlineUsers[`${uid}`] = uid;

  SecureWebSocket.clients.forEach((client) => {
    const onlineUsersPayload: Message = {
      protocol: 'SYS_CALL_ONLINE',
      systemMessage: Object.keys(onlineUsers),
    };
    client.send(JSON.stringify(onlineUsersPayload));
  });

  websocket.on('message', (data: any) => {
    routeIncomingMessage(websocket, data);

    const broadcastMessage: Message = JSON.parse(data);

    if (broadcastMessage.protocol === 'CHAT_MSG') {
      saveChatHistory(JSON.parse(data) as Message);
    }

    if (broadcastMessage.protocol === 'SYS_CALL_HISTORY') {
      asynchronouslyGetChatHistoryForUser(broadcastMessage);
    }
  });
};

const routeIncomingMessage = (_localSocket: any, data: any) => {
  SecureWebSocket.clients.forEach((clientSocket: any) => {
    const broadcastMessage: Message = JSON.parse(data);

    if (broadcastMessage.protocol !== 'CHAT_MSG') {
      return;
    }

    if (
      broadcastMessage.recipient === clientSocket.uid &&
      clientSocket.readyState === WebSocket.OPEN
    ) {
      clientSocket.send(JSON.stringify(broadcastMessage));
    }
  });
};

const saveChatHistory = async (message: Message) => {
  const chatPayload = new MessageModel({
    protocol: 'CHAT_MSG',
    sender: message.sender,
    recipient: message.recipient,
    messageText: message.messageText,
  });
  await chatPayload.save();
};

const getChatHistory = async (chatMemberOne: string, chatMemberTwo: string) => {
  const chatBetweenUsers: Message[] = await MessageModel.find({
    $or: [
      { $and: [{ sender: chatMemberOne }, { recipient: chatMemberTwo }] },
      { $and: [{ sender: chatMemberTwo }, { recipient: chatMemberOne }] },
    ],
  }).exec();
  return chatBetweenUsers;
};

const asynchronouslyGetChatHistoryForUser = async (historyRequest: Message) => {
  const chatHistory = await getChatHistory(
    historyRequest.sender as string,
    historyRequest.recipient as string,
  );

  const chatHistoryPayload: Message = {
    protocol: 'SYS_CALL_HISTORY',
    systemMessage: chatHistory,
  };

  SecureWebSocket.clients.forEach((clientSocket: any) => {
    if (
      historyRequest.sender === clientSocket.uid &&
      clientSocket.readyState === WebSocket.OPEN
    )
      clientSocket.send(JSON.stringify(chatHistoryPayload));
  });
};

SecureWebSocket.on('connection', handleConnection);
SecureWebSocket.on('listening', () => debug.log(`Socket is up on ${PORT}`));

export default SecureWebSocket;
