import * as Mongoose from 'mongoose';

const MessageSchema = new Mongoose.Schema(
  {
    protocol: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    messageText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default Mongoose.model('Message', MessageSchema);
