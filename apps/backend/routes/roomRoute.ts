import express from 'express';
import { createRoomController, joinRoomController } from '../controller/roomController';


export const roomRoute = express.Router();

roomRoute.post('/creatroom', createRoomController);
roomRoute.post('/joinroom', joinRoomController);
