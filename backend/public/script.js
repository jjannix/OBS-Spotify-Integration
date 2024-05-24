const albumArt = document.getElementById('album-art');
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const progress = document.getElementById('progress');
const apiCalls = document.getElementById('api-calls');
const cachedData = document.getElementById('cached-data');
const refreshButton = document.getElementById('refresh-button');

let callCount = 0;
let isCached = false;

function updateUI(data) {
    if (data.isPlaying) {
        albumArt.src = data.item.album.images[0].url;
        songTitle.textContent = data.item.name;
        artistName.textContent = data.item.artists[0].name;
        progress.textContent = `Progress: ${formatTime(data.progress_ms)} / ${formatTime(data.item.duration_ms)}`;
    } else {
        albumArt.src = '';
        songTitle.textContent = 'No song currently playing';
        artistName.textContent = '';
        progress.textContent = '';
    }

    apiCalls.textContent = ++callCount;
    cachedData.textContent = isCached;
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function fetchSongData() {
    isCached = false;
    const response = await fetch('/currently-playing');
    const data = await response.json();
    updateUI(data);
}

async function fetchSongDataWithCache() {
    isCached = true;
    const response = await fetch('/currently-playing');
    const data = await response.json();
    updateUI(data);
}

fetchSongData();
setInterval(fetchSongDataWithCache, 5000);

refreshButton.addEventListener('click', fetchSongData);