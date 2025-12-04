import type { Request, Response } from "express";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const signUpController = async (req: Request, res: Response) => {
    console.log(req.body)
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const signInController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatching = await bcrypt.compare(password, existingUser.password);
    if (!isMatching) {
      return res.status(401).json({ message: "Incorrect password." });
    }
    const token: string = jwt.sign({userId: existingUser.id, email }, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
