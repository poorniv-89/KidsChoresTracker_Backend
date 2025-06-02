//imports
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import globalErrorHandler from './middlewares/error.mjs';
import connectDB from './db/conn.mjs';

//setups
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001
connectDB();


//middlewares
app.use(express.json());
app.use(cors());


//error handling middleware
app.use(globalErrorHandler);

//listener
app.listen(PORT, ()=>{
    console.log(`server is running on PORT: ${PORT}`)
});


