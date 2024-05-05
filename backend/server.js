import express from 'express';
import dotenv from 'dotenv';
import ConnectMongoDB from './db/connectMongoDB.js';
// import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
const app=express();
dotenv.config();

const PORT=process.env.PORT || 5000;
app.get("/",(req,res)=>{
    res.send("App is running")
});
app.use(express.json());
app.use(cookieParser());
// app.use("/api/auth",authRoutes);
app.listen(PORT, ()=>{
    ConnectMongoDB();
    console.log(`Server running on port - ${PORT} `)
})