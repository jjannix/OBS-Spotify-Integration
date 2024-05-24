const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 4000;

let lastFetchedSong = null;
let lastFetchedTime = null;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN,
} = process.env;

const getAccessToken = async () => {
    try {
        console.log("Requesting access token...");
        const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: SPOTIFY_REFRESH_TOKEN,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
            },
        });

        console.log("Access token received:", response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error("Error getting access token:", error.response ? error.response.data : error.message);
        throw error;
    }
};

app.get('/currently-playing', async (req, res) => {
    try {
        const currentTime = Date.now();
        if (lastFetchedSong && lastFetchedTime) {
            const elapsedTime = currentTime - lastFetchedTime;
            const songDuration = lastFetchedSong.item.duration_ms;
            const songProgress = lastFetchedSong.progress_ms;
            if (elapsedTime + songProgress < songDuration) {
                console.log("Returning cached song data.");
                lastFetchedSong.progress_ms += elapsedTime;
                lastFetchedTime = currentTime;
                return res.status(200).json(lastFetchedSong);
            }
        }

        console.log("Fetching currently playing track...");
        const accessToken = await getAccessToken();
        const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.status === 204 || response.data === '') {
            console.log("No song is currently playing.");
            return res.status(200).json({ isPlaying: false });
        }

        console.log("Currently playing track data:", response.data);
        lastFetchedSong = response.data;
        lastFetchedTime = currentTime;
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching currently playing track:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});