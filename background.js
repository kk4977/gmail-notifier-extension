const CLIENT_ID = '856511270056-7g157tevteq4vi9oisrvnifniqn7teb2.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDmtFmXL9Y9o9BgY0FTox7b-RQgJra8HZw';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

let currentToken = null;

// Load the Google API Client Library
function loadGapi(callback) {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
        gapi.load('client:auth2', callback);
    };
    document.head.appendChild(script);
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

// OAuth authentication flow
function authenticate() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError || !token) {
                reject("Authentication failed");
            } else {
                currentToken = token;
                gapi.auth.setToken({ access_token: token });
                resolve(token);
            }
        });
    });
}

// Fetch unread emails
function checkForNewEmails() {
    if (!currentToken) {
        console.error("User is not authenticated");
        return;
    }

    gapi.client.gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 5
    }).then((response) => {
        const messages = response.result.messages || [];
        if (messages.length > 0) {
            const messageCount = messages.length;
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: `${messageCount} New Gmail(s)`,
                message: `You have ${messageCount} unread email(s).`,
                priority: 2
            });
        } else {
            console.log("No new unread emails.");
        }
    }).catch((error) => {
        console.error("Error fetching unread emails:", error);
    });
}

// Listen for messages from the popup to trigger authentication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "authenticate") {
        authenticate().then(() => {
            sendResponse({ status: 'authenticated' });
        }).catch((error) => {
            sendResponse({ status: 'failed', error: error });
        });
        return true; // Keep the message channel open for asynchronous response
    }
});

// Load GAPI and initialize on extension installation
chrome.runtime.onInstalled.addListener(() => {
    loadGapi(() => {
        initGapi();
    });
});

// Periodic check for unread emails
setInterval(() => {
    checkForNewEmails();
}, 60000); // Check every 60 seconds
