interface UserType {
  name: string;
  ws: WebSocket;
  admin: boolean;
  totalScores: number;
  yourTurn: boolean;
  userId: string;
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
  perRoundCorrectGuessers: number;
}
export class GameManager {
  private rooms: Map<string, [UserType[], RoundType[]]>;
  private setting: Map<string, Setting>;
  private points: number[];
  constructor() {
    this.rooms = new Map();
    this.setting = new Map();
    this.points = [500, 450, 400, 350, 300, 250, 200, 150, 100, 50];
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
    userId,
  }: {
    roomId: string;
    name: string;
    ws: WebSocket;
    admin: boolean;
    totalRounds: number;
    playedRounds: number;
    totalScores: number;
    yourTurn: boolean;
    userId: string;
  }) {
    if (admin) {
      this.rooms.set(roomId, [
        [{ name, ws, admin, totalScores, yourTurn, userId }],
        [{ totalRounds, playedRounds, perRoundCorrectGuessers: 0 }],
      ]);
      console.log(this.rooms);
      return true;
    }
    const existingRoom = this.rooms.get(roomId);
    if (!existingRoom && !admin) {
      return false;
    }
    existingRoom![0].some((user: UserType) => {
      if (user.userId === userId) {
        return false;
      }
    });
    existingRoom![0].push({
      name,
      ws,
      admin,
      totalScores,
      yourTurn,
      userId,
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
    const playerTurn = prevRound! % users.length;
    if (!users[playerTurn]?.yourTurn) {
      return false;
    }
    users[playerTurn + 1]!.yourTurn = true;
    users[playerTurn]!.yourTurn = false;
    const nextUser = users[playerTurn + 1]?.userId;
    console.log("name of the users", users[playerTurn - 1]?.name);

    const updatedRounds = [
      {
        totalRounds: rounds[0]!.totalRounds,
        playedRounds: prevRound! + 1,
        perRoundCorrectGuessers: 0,
      },
    ];
    this.rooms.set(roomId, [users, updatedRounds]);
    console.log(existingRoom);
    return { playedRound: prevRound! + 1, nextDrawer: nextUser };
  }
  updatePoints({ roomId, userId }: { roomId: string; userId: string }) {
    const existingRoom = this.rooms.get(roomId);
    if (!existingRoom) {
      console.log("room is not found");
      return false;
    }
    let matched = false;
    existingRoom![0].forEach((user) => {
      if (userId === user.userId) {
        matched = true;
      }
    });
    if (!matched) {
      console.log("you are not one of the room member in this room");
      return false;
    }
    const [users, rounds] = existingRoom;
    users.forEach((user) => {
      if (user.userId === userId) {
        user.totalScores +=
          this.points[rounds[0]!.perRoundCorrectGuessers++] ?? 50;
      }
    });
    console.log("points updated successfully");
    return true;
  }
}
