import { ExitStatus } from "typescript";

interface UserType {
  name: string;
  ws: WebSocket;
  admin: boolean;
  totalScores: number;
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
  }: {
    roomId: string;
    name: string;
    ws: WebSocket;
    admin: boolean;
    totalRounds: number;
    playedRounds: number;
    totalScores: number;
  }) {
    if (admin) {
      this.rooms.set(roomId, [
        [{ name, ws, admin, totalScores }],
        [{ totalRounds, playedRounds }],
      ]);
      console.log(this.rooms);
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
    const updatedRounds = [
      {
        totalRounds: rounds[0]!.totalRounds,
        playedRounds: prevRound! + 1,
      },
    ];
    this.rooms.set(roomId, [users, updatedRounds]);
    return {currentRound: prevRound! + 1};
  }
}
