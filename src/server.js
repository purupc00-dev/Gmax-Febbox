import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors'; 
import ShowboxAPI from './ShowboxAPI.js';
import FebboxAPI from './FebBoxApi.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3000;

// 🔒 SECURITY FIX: Only allow your specific Vercel domain to use this API
const allowedOrigins = ['https://gmaxhub.vercel.app', 'http://localhost:3000'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS security'));
        }
    }
}));

app.use(express.json());

const showboxAPI = new ShowboxAPI();
const febboxAPI = new FebboxAPI();

app.get('/', (req, res) => {
    res.send('Showbox and Febbox API is securely working!');
});

app.get('/api/autocomplete', async (req, res) => {
    const { keyword, pagelimit } = req.query;
    try {
        const results = await showboxAPI.getAutocomplete(keyword, pagelimit);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/search', async (req, res) => {
    const { type = 'all', title, page = 1, pagelimit = 20 } = req.query;
    try {
        const results = await showboxAPI.search(title, type, page, pagelimit);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/movie/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const movieDetails = await showboxAPI.getMovieDetails(id);
        res.json(movieDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/show/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const showDetails = await showboxAPI.getShowDetails(id);
        res.json(showDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/febbox/id', async (req, res) => {
    const { id, type } = req.query;
    try {
        const febBoxId = await showboxAPI.getFebBoxId(id, type);
        res.json({ febBoxId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/febbox/files', async (req, res) => {
    const { shareKey, parent_id = 0 } = req.query;
    const cookie = req.headers['x-auth-cookie'] || null;
    try {
        const files = await febboxAPI.getFileList(shareKey, parent_id , cookie);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🚀 ZERO-BANDWIDTH FIX: Extract User IP and forward it to Febbox
app.get('/api/febbox/links', async (req, res) => {
    const { shareKey, fid } = req.query;
    const cookie = req.headers['x-auth-cookie'] || null;
    
    // Securely grab the user's real IP, not the server's IP
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (clientIp && clientIp.includes(',')) {
        clientIp = clientIp.split(',')[0].trim();
    }

    try {
        const links = await febboxAPI.getLinks(shareKey, fid , cookie, clientIp);
        res.json(links);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running safely at http://localhost:${port}`);
});
