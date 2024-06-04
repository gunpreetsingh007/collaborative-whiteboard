/// <reference path="./types/typing.d.ts" />
import express from 'express';
import dotenv from 'dotenv';
import { prisma } from './database/prisma';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import fs from 'fs';

dotenv.config();
const port = 8000;

const init = async () => {
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        path: "/socket",
        cors: {
            origin: process.env.FRONTEND_URL!
        },
    });

    app.use(express.json({ limit: '5mb' }));
    app.use(cors({ origin: process.env.FRONTEND_URL! }));

    app.get('/api', (req: express.Request, res: express.Response) => {
        res.json({ message: 'Server is running' });
    });

    app.post('/api/create-room', async (req: express.Request, res: express.Response) => {
        // Generate a new room ID
        const room = await prisma.room.create({
            data: {},
        });

        res.json({ roomId: room.id });
    });

    app.get('/api/check-room/:id', async (req: express.Request, res: express.Response) => {
        const room = await prisma.room.findUnique({
            where: { id: req.params.id },
        });

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json({ roomId: room.id });
    });

    app.get('/api/join-room/:id', async (req: express.Request, res: express.Response) => {
        const room = await prisma.room.findUnique({
            where: { id: req.params.id },
        });

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Create a token that represents the room ID
        const token = jwt.sign({ roomId: room.id }, process.env.JWT_SECRET!);

        let diagramBase64URL = null;
        if (fs.existsSync(`./diagrams/${room.id}.txt`)) {
            diagramBase64URL = fs.readFileSync(`./diagrams/${room.id}.txt`, 'utf-8');
        }

        res.json({ roomId: room.id, diagramBase64URL, token });
    });

    app.post('/api/save-diagram', async (req: express.Request, res: express.Response) => {
        const { diagramBase64URL } = req.body;
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const roomToken = authorization.split(' ')[1];

        try {
            const { roomId } = jwt.verify(roomToken as string, process.env.JWT_SECRET!) as JwtDecodedPayload;
            fs.writeFileSync(`./diagrams/${roomId}.txt`, diagramBase64URL, 'utf-8');
            res.json({ message: 'Diagram saved' });
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Failed to save diagram' });
        }
    });

    io.on('connection', (socket) => {
        socket.on('join-room', ({ roomToken }) => {
            try {
                const { roomId } = jwt.verify(roomToken, process.env.JWT_SECRET!) as JwtDecodedPayload;
                socket.join(roomId);
            }
            catch (e) {
                console.error(e);
            }
        });

        socket.on('draw-line', ({ prevPoint, currentPoint, color, roomToken }: DrawLine) => {
            try {
                const { roomId } = jwt.verify(roomToken, process.env.JWT_SECRET!) as JwtDecodedPayload;
                socket.broadcast.to(roomId).emit('draw-line', { prevPoint, currentPoint, color });
            }
            catch (e) {
                console.error(e);
            }
        });

    });

    server.listen(port, () => {
        console.info(`Listening on port ${port}`);
    });
};

//check if database is connected and then initialize the server
prisma.$connect()
    .then(() => {
        init();
    })
    .catch((e: Error) => {
        console.error(e);
        process.exit(1);
    });