import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log("\nMongoDB connected");
  } catch (err) {
    console.log("\nMongoDB connection error : ", err);
    process.exit(1);
  }
};

export default connectDB;
