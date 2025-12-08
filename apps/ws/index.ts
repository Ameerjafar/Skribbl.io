import WebSocket from "ws";
import dotenv from "dotenv";
import { GameManager } from "./GameManager";
interface UserType {
  ws: WebSocket;
  name: string;
}
dotenv.config();
const gameManager = new GameManager();

const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT || 8080 });
wss.on("connection", async (ws: WebSocket, req: any) => {
  ws.on("message", (data: any) => {
    const parseData = JSON.parse(data);
    console.log(parseData);
    if (parseData.type === "createRoom") {
      const roomId = parseData.roomId;
      const name = parseData.name;
      const admin = parseData.admin;
      const userId = parseData.userId;
      const addSetting = {
        totalPlayers: parseData.totalPlayers,
        drawtime: parseData.drawtime,
        totalRounds: parseData.totalRounds,
        wordCount: parseData.wordCount,
      };
      const addUser = gameManager.addUser({
        roomId,
        name,
        ws,
        admin,
        totalRounds: addSetting.totalPlayers,
        playedRounds: 0,
        totalScores: 0,
        yourTurn: true,
        userId,
      });
      if (!addUser) {
        return ws.send(JSON.stringify("addUser is failed"));
      }
      const allUser = gameManager.getAllUser({ roomId });
      gameManager.setSetting({ setting: addSetting, roomId });
      if (!allUser) {
        return ws.send(JSON.stringify("There is no user in this room"));
      }
      allUser?.forEach((user: UserType) => {
        if (user.ws !== ws && user.ws.readyState === WebSocket.OPEN) {
          user.ws(JSON.stringify(`${parseData.name} joined the room`));
        }
      });
    } else if (parseData.type === "joinRoom") {
      const roomId = parseData.roomId;
      const name = parseData.name;
      const admin = parseData.admin;
      const userId = parseData.userId;
      const addUser = gameManager.addUser({
        roomId,
        name,
        admin,
        ws,
        playedRounds: 0,
        totalRounds: parseData.totalRounds,
        totalScores: 0,
        yourTurn: false,
        userId,
      });
      if (!addUser) {
        return ws.send(JSON.stringify("add user is failed"));
      }
      const allUser = gameManager.getAllUser({ roomId });
      allUser?.forEach((user: UserType) => {
        if (user.ws !== ws && user.ws.readyState === WebSocket.OPEN) {
          user.ws.send(JSON.stringify(`${name} joined the room`));
        }
      });
    }

    if (parseData.type === "updateRound") {
      const roomId = parseData.roomId;
      const roundResponse = gameManager.updateRound({ roomId });
      if (!roundResponse) {
        return ws.send(JSON.stringify("we cannot update the round"));
      }
      const allUser = gameManager.getAllUser({ roomId });
      if (!allUser) {
        return ws.send(JSON.stringify("we cannot get the user"));
      }
      allUser?.forEach((user) => {
        if (user.ws.readyState === WebSocket.OPEN) {
          const object = {
            type: "roundUpdated",
            currenRound: roundResponse,
            userId: roundResponse.nextDrawer,
          };
          user.ws.send(JSON.stringify(object));
        }
      });
    }
    if (parseData.type === "updatePoints") {
      const roomId = parseData.roomId;
      const response = gameManager.updatePoints({
        roomId,
        userId: parseData.userId,
      });
      if (!response) {
        ws.send(JSON.stringify("we cannot update the score properly"));
      }
      const allUser = gameManager.getAllUser({ roomId });
      const object = {
        type: "message",
        message: `${parseData.name} is guessed the word`,
        userId: parseData.userId,
      };
      allUser?.forEach((user) => {
        if (user.ws.readyState === WebSocket.OPEN) {
          user.ws.send(JSON.stringify(object));
        }
      });
    }
  });
  ws.on("error", (error: unknown) => {
    ws.send(`${error} This is the error you are getting`);
  });
});
