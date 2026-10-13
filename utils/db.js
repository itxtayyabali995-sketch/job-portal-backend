import mongoose from "mongoose";

const connectDB = async () => {
try {
const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        throw new Error("MONGO_URI is missing from the .env file");
    }

    await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
    });

    console.log("MongoDB connected successfully");
} catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
}

};

export default connectDB;
