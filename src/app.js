import express from "express";
import http from "http";
import dotenv from "dotenv";
import path from "path";
import {fileURLToPath} from "url";
import connectDB from "./config/db-connect.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Serve the uploads folder
// Resolve the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// user routes
import userRoute from "./routes/api.routes.js";
app.use("/api", userRoute);

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  await connectDB();
  console.log(`\nServer is running on port ${PORT}`);
});
