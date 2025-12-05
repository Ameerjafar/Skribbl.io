import express from "express";
import { authRoute } from "./authRoute";
import { roomRoute } from "./roomRoute";
export const routes = express.Router();

routes.use("/auth", authRoute);
routes.use('/room', roomRoute)