import mongoose from 'mongoose';
import config from 'config';

const dbUrl = config.get('mongoUrl') as string;
console.info(dbUrl, 'dbUrl')
const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Database connected success...');
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
