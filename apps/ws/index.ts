import WebSocket from 'ws';
import dotenv from 'dotenv';
import { isEqualsGreaterThanToken } from 'typescript';

dotenv.config();
const wss = new WebSocket.Server({port: process.env.WEBSOCKET_PORT || 8080});

wss.on('connection', async (ws: WebSocket, req: any) => {   
    console.log("hello", req.url);
    const url = new URL(req.url)
    console.log("url wala thing", url);
    ws.on('message', (data: string) => {

        const parseData = JSON.parse(data);
        if(parseData.type === 'startGame') {

        }
        else if(parseData.type === 'endGame') {

        }
        else if(parseData.type === '') {

        }
    })
})