import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [song, setSong] = useState(null);
    const [progress, setProgress] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        const fetchCurrentlyPlaying = async () => {
            try {
                const response = await axios.get('http://localhost:4000/currently-playing');
                setSong(response.data);
    
                if (response.data.is_playing) {
                    const songDuration = response.data.item.duration_ms;
                    const songProgress = response.data.progress_ms;
                    setProgress((songProgress / songDuration) * 100);
    
                    const remainingTime = songDuration - songProgress;
    
                    if (intervalId) {
                        clearInterval(intervalId);
                    }
    
                    const interval = setInterval(() => {
                        const currentTime = Date.now();
                        const elapsed = currentTime - response.data.timestamp;
                        const newProgress = (songProgress + elapsed) / songDuration * 100;
    
                        if (newProgress >= 100) {
                            clearInterval(interval);
                            fetchCurrentlyPlaying();
                        } else {
                            setProgress(newProgress);
                        }
                    }, 1000);
    
                    setIntervalId(interval);
    
                    setTimeout(() => {
                        clearInterval(interval);
                        fetchCurrentlyPlaying();
                    }, remainingTime);
                }
            } catch (error) {
                console.error("Error fetching currently playing song", error);
            }
        };
    
        fetchCurrentlyPlaying();
    
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [intervalId]);
    

    return (
        <div className="container">
            <h1>Currently Playing Song</h1>
            <div className="song-info">
                {song && song.is_playing ? (
                    <>
                        <img src={song.item.album.images[0].url} alt={song.item.name} />
                        <div className="song-details">
                            <h2>{song.item.name}</h2>
                            <p>by {song.item.artists.map(artist => artist.name).join(', ')}</p>
                            <p>Album: {song.item.album.name}</p>
                            <p id="remaining-time">Remaining Time: {song.item.duration_ms - song.progress_ms}ms</p>
                        </div>
                    </>
                ) : (
                    <p>No song is currently playing.</p>
                )}
            </div>
            <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
}

export default App;
