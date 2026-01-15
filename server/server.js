import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import db from './db.js';
import { LinkMonitor } from './services/LinkMonitor.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Get data by key
app.get('/api/data/:key', (req, res) => {
    const { key } = req.params;
    db.get('SELECT value FROM store WHERE key = ?', [key], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (row && row.value) {
            res.json(JSON.parse(row.value));
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    });
});

// Save data by key
app.post('/api/data/:key', (req, res) => {
    const { key } = req.params;
    const value = JSON.stringify(req.body);

    db.run(
        'INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
        [key, value, value],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json({ success: true });
        }
    );
});

// Create HTTP server and Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Initialize LinkMonitor
const linkMonitor = new LinkMonitor(io);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);

    socket.on('start_monitoring', () => {
        console.log('[Socket] Start monitoring requested');
        linkMonitor.start();
    });

    socket.on('stop_monitoring', () => {
        console.log('[Socket] Stop monitoring requested');
        linkMonitor.stop();
    });

    socket.on('update_links', (links) => {
        console.log('[Socket] Links updated:', links.length);
        linkMonitor.updateLinks(links);
    });

    socket.on('disconnect', () => {
        console.log('[Socket] Client disconnected:', socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
