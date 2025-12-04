import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const PORT = process.env.BACKEND_PORT;
const app = express();
app.use(cors());

app.listen(PORT, () => {
  console.log(`port is running on ${PORT}`);
});
