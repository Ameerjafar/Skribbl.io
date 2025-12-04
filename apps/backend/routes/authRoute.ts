import express from "express";
import {
  signInController,
  signUpController,
} from "../controller/authController";

export const authRoute = express.Router();

authRoute.post("/signup", signUpController);
authRoute.post("/signin", signInController);
