const CLIENT_ID = '856511270056-7g157tevteq4vi9oisrvnifniqn7teb2.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDmtFmXL9Y9o9BgY0FTox7b-RQgJra8HZw';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

let currentToken = null;

// Initialize the Google API Client
function loadGmailApi() {
    gapi.client.setApiKey(API_KEY);
    return gapi.client.load('https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest');
}

// OAuth authentication flow
function authenticate() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
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
        console.log("User is not authenticated");
        return;
    }

    const request = gapi.client.gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread', // Query for unread emails
        maxResults: 5    // Limit to 5 unread emails
    });

    request.execute(function (response) {
        if (response.messages && response.messages.length > 0) {
            let messageCount = response.messages.length;
            // Send notification to the extension
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: `${messageCount} New Gmail(s)`,
                message: `You have ${messageCount} unread email(s).`,
                priority: 2
            });
        }
    });
}

// Listen for messages from the popup to trigger authentication
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "authenticate") {
        authenticate().then(() => {
            sendResponse({ status: 'authenticated' });
        }).catch((error) => {
            sendResponse({ status: 'failed', error: error });
        });
        return true; // Keep the message channel open for asynchronous response
    }
});

// Periodic check for unread emails
setInterval(() => {
    checkForNewEmails();
}, 60000); // Every 60 seconds

// Load the API and authenticate on extension installation
chrome.runtime.onInstalled.addListener(function () {
    gapi.load('client:auth2', function () {
        gapi.auth2.init({
            client_id: CLIENT_ID
        }).then(function () {
            console.log("Google API Client Loaded");
        });
    });
});
