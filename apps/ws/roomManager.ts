interface UserType {
  ws: WebSocket;
  name: string;
}

export class RoomManager {
  private rooms: Map<string, UserType[]>;

  constructor() {
    this.rooms = new Map();
  }
  addUser({
    roomId,
    name,
    ws,
    admin,
  }: {
    roomId: string;
    name: string;
    ws: WebSocket;
    admin: boolean;
  }) {
    if (admin) {
      this.rooms.set(roomId, [{ name, ws }]);
    }
    const existingRoom = this.rooms.get(roomId);
    if (!existingRoom && !admin) {
      return false;
    }
    existingRoom!.some((user: UserType) => {
      if (user.ws === ws) {
        return false;
      }
    });
    existingRoom!.push({
      name,
      ws,
    });
    return true;
  }
  getAllUser({ roomId }: { roomId: string }) {
    const existingRoom = this.rooms.get(roomId);
    if (!existingRoom) {
      return null;
    }
    return existingRoom;
  }
}
