const CLIENT_ID = '856511270056-7g157tevteq4vi9oisrvnifniqn7teb2.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDmtFmXL9Y9o9BgY0FTox7b-RQgJra8HZw';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

// Load the Google API Client Library
function loadGapi(callback) {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
        gapi.load('client:auth2', callback);
    };
    document.body.appendChild(script);
}

// Initialize the Google API Client
function initGapi() {
    return gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(() => {
        console.log("Google API Client Initialized");
    }).catch((error) => {
        console.error("Error initializing GAPI:", error);
    });
}

// Handle Login Button Click
document.getElementById('loginBtn').addEventListener('click', () => {
    loadGapi(() => {
        initGapi().then(() => {
            chrome.runtime.sendMessage({ action: 'authenticated' });
        });
    });
});
