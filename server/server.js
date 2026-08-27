import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.json({ message: "Book Lele API is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});