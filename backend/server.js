import express from 'express';
import dotenv from 'dotenv';
import ConnectMongoDB from './db/connectMongoDB.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from 'cloudinary';
const app=express();
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const PORT=process.env.PORT || 5000;
app.get("/",(req,res)=>{
    res.send("App is running")
});
app.use(express.json());
app.use(express.urlencoded({extended: true})) //to parse form data
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/post",postRoutes);
app.listen(PORT, ()=>{
    ConnectMongoDB();
    console.log(`Server running on port - ${PORT} `)
})