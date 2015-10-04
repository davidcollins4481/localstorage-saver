chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        sendResponse({
            localStorage: window.localStorage,
            sessionStorage: window.sessionStorage,
            hostname: window.location.hostname
        });
    }
);
