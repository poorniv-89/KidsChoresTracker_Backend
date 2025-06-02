//imports
import dotenv from 'dotenv';
import mongoose from 'mongoose';

//setups
dotenv.config();
const connectionStr = process.env.mongoURI;


async function connectDB() {
    try{
        await mongoose.connect(connectionStr);
        console.log(`connected to MongoDB...`);
    }
    catch(err)
    {
        console.error(err);
    }
    
}
export default connectDB;