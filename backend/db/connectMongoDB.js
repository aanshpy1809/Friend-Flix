import mongoose from "mongoose"


const ConnectMongoDB = async() => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mongodb")
  } catch (error) {
    console.log("Error connecting to mongodb",error);
  }
}

export default ConnectMongoDB
