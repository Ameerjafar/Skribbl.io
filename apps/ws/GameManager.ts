import { ExitStatus } from "typescript";

interface UserType {
  name: string;
  ws: WebSocket;
  admin: boolean;
  totalScores: number;
  yourTurn: boolean;
}
interface Setting {
  totalPlayers: number;
  drawtime: number;
  totalRounds: number;
  wordCount: number;
}
interface RoundType {
  totalRounds: number;
  playedRounds: number;
}
export class GameManager {
  private rooms: Map<string, [UserType[], RoundType[]]>;
  private setting: Map<string, Setting>;
  constructor() {
    this.rooms = new Map();
    this.setting = new Map();
  }
  addUser({
    roomId,
    name,
    ws,
    admin,
    totalRounds,
    playedRounds,
    totalScores,
    yourTurn,
  }: {
    roomId: string;
    name: string;
    ws: WebSocket;
    admin: boolean;
    totalRounds: number;
    playedRounds: number;
    totalScores: number;
    yourTurn: boolean;
  }) {
    if (admin) {
      this.rooms.set(roomId, [
        [{ name, ws, admin, totalScores, yourTurn }],
        [{ totalRounds, playedRounds }],
      ]);
      console.log(this.rooms);
      return true;
    }
    const existingRoom = this.rooms.get(roomId);
    if (!existingRoom && !admin) {
      return false;
    }
    existingRoom![0].some((user: UserType) => {
      if (user.ws === ws) {
        return false;
      }
    });
    existingRoom![0].push({
      name,
      ws,
      admin,
      totalScores,
      yourTurn,
    });
    return true;
  }
  getAllUser({ roomId }: { roomId: string }) {
    const existingRoom = this.rooms.get(roomId);
    console.log("existingRoom", existingRoom);
    if (!existingRoom) {
      return null;
    }
    return existingRoom[0];
  }
  setSetting({ setting, roomId }: { setting: Setting; roomId: string }) {
    const existingRoom = this.rooms.get(roomId);
    if (!existingRoom) {
      console.log("roomId is not available to set the settings");
      return false;
    }
    this.setting.set(roomId, setting);
    return true;
  }
  changeSettings({
    updateSetting,
    roomId,
    admin,
  }: {
    updateSetting: Setting;
    roomId: string;
    admin: boolean;
  }) {
    const existingRoom = this.rooms.get(roomId);
    if (!existingRoom) {
      console.log("roomId is not available to set the settings");
      return false;
    } else if (!admin) {
      console.log("only admin can upadate the settings");
      return false;
    }
    this.setting.set(roomId, updateSetting);
  }
  updateRound({ roomId }: { roomId: string }) {
    const existingRoom = this.rooms.get(roomId);
    if (!existingRoom) {
      console.log("roomId is not available");
      return false;
    }
    const [users, rounds] = existingRoom;
    const prevRound = rounds[0]?.playedRounds;
    const playerTurn = (prevRound!) % users.length;
    if(!users[playerTurn]?.yourTurn) {
      return false;
    } 
    users[playerTurn + 1]!.yourTurn = true;
    users[playerTurn]!.yourTurn = false;
    console.log("name of the users", users[playerTurn - 1]?.name);
    
    const updatedRounds = [
      {
        totalRounds: rounds[0]!.totalRounds,
        playedRounds: prevRound! + 1,
      },
    ];
    this.rooms.set(roomId, [users, updatedRounds]);
    console.log(existingRoom)
    return { playedRound: prevRound! + 1 };
  }
}
