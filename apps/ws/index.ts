import WebSocket from "ws";
import dotenv from "dotenv";
import { RoomManager } from "./roomManager";
import { getModeForUsageLocation } from "typescript";
interface UserType {
  ws: WebSocket;
  name: string;
}
dotenv.config();
const roomManager = new RoomManager();
const guessWord = new Map<string, string>();
const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT || 8080 });
wss.on("connection", async (ws: WebSocket, req: any) => {
  const url = new URL(req.url, `http://localhost${req.url!}`);
  const searchParams: any = url.searchParams;
  const roomId = searchParams.roomId;
  const userName = searchParams.name;
  const admin = searchParams.admin;
  const chance = 1;
  roomManager.addUser({ roomId, name: userName, ws, admin,});
  if (!roomId || !userName || !admin) {
    return ws.close(1008, "missing requirements");
  }
  const allUsers: UserType[] | null = roomManager.getAllUser(roomId);
  if (!allUsers) {
    throw new Error("room is not found");
  }
  allUsers.forEach((user: UserType) => {
    if (user.ws !== ws && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(`${userName} joined the room`);
    }
  });
  ws.on("message", (data: string) => {
    const parseData = JSON.parse(data);
    if (parseData.type === "updateSetting") {
      allUsers.forEach((user: UserType) => {
        if (user.ws !== ws && user.ws.readyStae === WebSocket.OPEN) {
          user.ws(JSON.stringify(parseData));
        }
      });
    } else if (parseData.type === "startRound") {
      if (allUsers.length < 2) {
        ws.send(JSON.stringify("Atleast two players to start the game"));
      }
      allUsers.forEach((user: UserType) => {
        if (user.ws !== ws && WebSocket.OPEN === user.ws.readyState) {
          user.ws(JSON.stringify(parseData));
        }
      });
    } else if (parseData.type === "gussedWord") {
      const gussedWord = parseData.guessedWord;
      const correctWord = guessWord.get(roomId);
      let isGuessCorrect = false;
      if (correctWord === gussedWord) {
        isGuessCorrect = true;
      }
      allUsers.forEach((user: UserType) => {
        const object = {
          type: "message",
          isGuessCorrect,
        };
        user.ws(JSON.stringify(object));
      });
    }
  });
});
