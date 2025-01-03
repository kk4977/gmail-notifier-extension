document.getElementById('loginBtn').addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: 'authenticate' }, function(response) {
        if (response.status === 'authenticated') {
            document.getElementById('status').textContent = "You are logged in!";
        } else {
            document.getElementById('status').textContent = "Login failed: " + response.error;
        }
    });
});

document.getElementById('checkBtn').addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: 'check' }, function(response) {
        console.log(response);
    });
});
