import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();
const wss = new WebSocket.Server({port: process.env.WEBSOCKET_PORT || 8080});