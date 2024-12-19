"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = require("crypto");
const zod_1 = require("zod");
const sonner_1 = require("sonner");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
app.use((0, cors_1.default)({
    credentials: true,
    methods: ["GET", "POST"]
}));
app.use(express_1.default.json());
let polls = {};
const pollSchema = zod_1.z.object({
    question: zod_1.z.string().min(1, "Question is Required"),
    options: zod_1.z.array(zod_1.z.string()).min(2, "At least two options are required")
});
app.post('/create-poll', (req, res) => {
    try {
        const { question, options } = pollSchema.parse(req.body);
        const id = (0, crypto_1.randomBytes)(5).toString("hex").toUpperCase();
        polls[id] = { question, options, votes: Array(options.length).fill(0) };
        res.status(201).json({
            question,
            id,
            options
        });
    }
    catch (er) {
        sonner_1.toast.info("Please Enter the Title & Options");
    }
});
app.get('/poll/:id', (req, res) => {
    try {
        const { id } = req.params;
        const pollId = id;
        if (polls[pollId]) {
            res.status(200).json(polls[pollId]);
        }
        else {
            res.status(404).json({ message: 'Poll not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});
app.post('/vote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pollId, optionIndex } = req.body;
        if (!polls[pollId]) {
            return res.status(404).json({ message: 'Poll not found' });
        }
        if (optionIndex < 0 || optionIndex >= polls[pollId].options.length) {
            return res.status(400).json({ message: 'Invalid option index' });
        }
        polls[pollId].votes[optionIndex]++;
        res.status(200).json({ message: 'Vote submitted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}));
wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.send(JSON.stringify(polls));
    ws.on('message', (message) => {
        const { pollId, optionIndex } = JSON.parse(message);
        if (polls[pollId]) {
            polls[pollId].votes[optionIndex]++;
            wss.clients.forEach((client) => {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(JSON.stringify(polls[pollId]));
                }
            });
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
process.on('SIGINT', () => {
    wss.clients.forEach((client) => client.close());
    server.close(() => {
        console.log('Server shut down gracefully');
        process.exit(0);
    });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
