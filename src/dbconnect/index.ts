import Mongoose from 'mongoose';
import 'dotenv/config';

export default Mongoose.connect(`${process.env.MONGODB_URL}`)
  .then(() => console.log('Atlas db connect success'))
  .catch((error) => console.error(error));
