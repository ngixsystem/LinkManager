import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for potential image data

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
