import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]!.split(" ")[1];
  try {
    if (!token) {
      return res.status(401).json({ message: "Token is not found" });
    }
    jwt.verify(token, process.env.JWT_SECRET!, (data: any, err: unknown) => {
      if (err) {
        return res.status(403).json({ message: "unauthoirzed" });
      }
      req.userId = data.userId;
      next();
    });
  } catch (error: any) {
    return res.status(500).json({ error });
  }
};
