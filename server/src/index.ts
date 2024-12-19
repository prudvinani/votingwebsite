

import express, { Request, Response } from 'express';
import { WebSocketServer ,WebSocket} from 'ws';
import http from 'http';
import cors from "cors"
import { randomBytes } from 'crypto';
import {z} from "zod"
import { toast } from 'sonner';


const app = express();

const server = http.createServer(app);
const wss = new WebSocketServer({ server});

app.use(cors({
    credentials:true,
    methods:["GET","POST"]
}))
app.use(express.json());

interface Poll {
    question: string;
    options: string[];
    votes: number[];
}

type Polls =Record<string,Poll>

let polls: Polls = {}; 





const pollSchema=z.object({
    question:z.string().min(1,"Question is Required"),
    options: z.array(z.string()).min(2, "At least two options are required")
})



app.post('/create-poll', (req: Request, res: Response) => {
   try{
    const {question,options}=pollSchema.parse(req.body);
    const id=randomBytes(5).toString("hex").toUpperCase();
    polls[id] = { question, options, votes: Array(options.length).fill(0) };
res.status(201).json({
    question,
    id,
    options
})

   }catch(er){
toast.info("Please Enter the Title & Options")
   }
});





app.get('/poll/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pollId=id;
        
        if (polls[pollId]) {
            res.status(200).json(polls[pollId]);
        } else {
            res.status(404).json({ message: 'Poll not found' });
        }
    } catch (error:any) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

app.post('/vote', async (req: Request, res: Response): Promise<any> => {
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
    } catch (error:any) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});




wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.send(JSON.stringify(polls));

    ws.on('message', (message: string) => {
        const { pollId, optionIndex } = JSON.parse(message);
        
        if (polls[pollId]) {
            polls[pollId].votes[optionIndex]++;
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
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
