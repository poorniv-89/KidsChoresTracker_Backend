//imports
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import error from './middlewares/error.mjs';

//setups
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001


//middlewares
app.use(express.json());
app.use(cors());


//error handling middleware
app.use(error);

//listener
app.listen(PORT, ()=>{
    console.log(`server is running on PORT: ${PORT}`)
});


