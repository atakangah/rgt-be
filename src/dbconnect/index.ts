import Mongoose from 'mongoose';

export default Mongoose.connect(
  'mongodb+srv://admin:admin.mongodb.01@cluster0.txrjeej.mongodb.net/?retryWrites=true&w=majority',
)
  .then(() => console.log('Atlas db connect success'))
  .catch((error) => console.error(error));
