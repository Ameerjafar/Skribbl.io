import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { routes } from "./routes/routes";
import { redis } from '@repo/redis'
dotenv.config();
const PORT = process.env.BACKEND_PORT;

const app = express();
app.use(cors());
app.use(express.json())
app.use('/api/v1', routes);


app.listen(PORT, () => {
  console.log(`port is running on ${PORT}`);
});
