import WebSocket from "ws";
import dotenv from "dotenv";
import { RoomManager } from "./roomManager";
import { stringWidth } from "bun";
interface UserType {
  ws: WebSocket;
  name: string;
}
dotenv.config();
const roomManager = new RoomManager();
const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT || 8080 });
wss.on("connection", async (ws: WebSocket, req: any) => {
  const url = new URL(req.url, `http://localhost${req.url!}`);
  const searchParams: any = url.searchParams;
  const roomId = searchParams.roomId;
  const userName = searchParams.name;
  const admin = searchParams.admin
  const addUser = roomManager.addUser({roomId, name: userName, ws, admin});
  if(!roomId || !userName || !admin) {
    return ws.close(1008, "missing requirements");
  }
  ws.on("message", (data: string) => {
    const parseData = JSON.parse(data);
    const allUsers: UserType[] | null = roomManager.getAllUser(roomId);
    if(!allUsers) {
        throw new Error("No User in this roomId but roomId is present");
    }
    if (parseData.type === "joinRoom") {
      allUsers!.forEach((value: UserType) => {
        if (ws !== value.ws && ws.readyState === WebSocket.OPEN) {
          value.ws.send(JSON.stringify(`${userName} Joined the room`));
        }
      });
    }
  });
});
