//imports
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import globalErrorHandler from './middlewares/error.mjs';
import connectDB from './db/conn.mjs';
import parentRoutes from './routes/parentRoutes.mjs';
import childRoutes from './routes/childRoutes.mjs';

//setups
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001
connectDB();


//middlewares
app.use(express.json());
app.use(cors());

//routes
app.use('/api/parent', parentRoutes);
app.use('/api/child', childRoutes);


//error handling middleware
app.use(globalErrorHandler);

//listener
app.listen(PORT, ()=>{
    console.log(`server is running on PORT: ${PORT}`)
});


