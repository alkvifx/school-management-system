import mongoose from "mongoose";
import { createSuperAdminIfNotExists } from "../utils/createSuperAdmin.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected 🔥");
    
    // Create Super Admin after successful DB connection
    await createSuperAdminIfNotExists();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
