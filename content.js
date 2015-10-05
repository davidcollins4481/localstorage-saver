chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.apply) {
            var applySessionStorage  = request.state.sessionStorage,
                applyLocalStorage    = request.state.localStorage;

            Object.keys(applySessionStorage).forEach(function(key) {
                window.sessionStorage[key] = applySessionStorage[key];
            });

            Object.keys(applyLocalStorage).forEach(function(key) {
                window.localStorage[key] = applyLocalStorage[key];
            });
        } else {
            sendResponse({
                localStorage: window.localStorage,
                sessionStorage: window.sessionStorage,
                hostname: window.location.hostname
            });
        }
    }
);
