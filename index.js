import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.routes.js";
import companyRoute from "./routes/company.routes.js";
import jobRoute from "./routes/job.routes.js";
import applicationRoute from "./routes/application.routes.js";

// Safe environment variables loadingg
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: true,
    credentials: true
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

// apis  
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

// Database connection pehle call karein taake server start hone se pehle DB connect ho jaye
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
}).catch((err) => {
    console.log("Database connection failed:", err);
});