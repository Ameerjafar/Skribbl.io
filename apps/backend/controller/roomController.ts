import { prisma } from "@repo/db";
import { redis } from "@repo/redis";
import type { Request, Response } from "express";
interface createRoomType {
  creator: string;
  players: [{}];
}
export const createRoomController = async (req: Request, res: Response) => {
  const { userId, roomId } = req.body;
  try {
    if (!userId || !roomId) {
      return res.status(400).json({ message: "missing requirements" });
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      return res.status(404).json({ message: "user is not found" });
    }
    const existingRoom = await redis.get(roomId);
    if (existingRoom) {
      return res
        .status(409)
        .json({ message: "room is already found try creating another room" });
    }
    const roomObject: createRoomType = {
      creator: userId,
      players: [{ userId }],
    };
    await redis.set("roomId", JSON.stringify(roomObject));
    return res.status(201).json({ message: "room created successfully" });
  } catch (error: unknown) {
    return res.status(500).json({ error });
  }
};

export const joinRoomController = async (req: Request, res: Response) => {
  const { userId, roomId } = req.body;
  try {
    if (!userId || !roomId) {
      return res.status(400).json({ messsage: "missing requirements" });
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      return res.status(404).json({ message: "user is not found" });
    }
    const existingRoom = await redis.get(roomId);
    if (!existingRoom) {
      return res.status(404).json({ message: "room does not exist" });
    }
    const parseData: createRoomType = JSON.parse(existingRoom);
    parseData.players.push({ userId });
    await redis.set(roomId, JSON.stringify(parseData));
    return res.status(200).json({ message: "joined the room successfully" });
  } catch (error: unknown) {
    return res.status(500).json({ error });
  }
};
