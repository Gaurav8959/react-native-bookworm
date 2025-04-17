import express from "express";
import cors from "cors";
import "dotenv/config"
import router from "./routes/authRoutes.js";
import bookroutes from "./routes/bookRoutes.js"
import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";

const app = express();
app.use(express.json());
app.use(cors())
const PORT = process.env.PORT || 3000;

job.start();
app.use("/api/auth", router);
app.use("/api/books", bookroutes);

app.listen(PORT, () => {
    console.log(`Server is running on PORT No: ${PORT}`);
    connectDB();
});
