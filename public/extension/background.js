// background.js

// Listen for messages from the proxy script (running on localhost)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target === 'NUSUK_EXTENSION_BG') {
        handleAppMessage(message.data);
    }
});

function handleAppMessage(data) {
    const { type, payload } = data;

    if (type === 'OPEN_AND_LOGIN') {
        // 1. Check if Nusuk login tab exists
        chrome.tabs.query({ url: "https://masar.nusuk.sa/*" }, (tabs) => {
            if (tabs.length > 0) {
                // Tab exists, activate it and send login data
                const tabId = tabs[0].id;
                chrome.tabs.update(tabId, { active: true });
                chrome.tabs.sendMessage(tabId, {
                    target: 'NUSUK_CONTENT',
                    type: 'DO_LOGIN',
                    payload
                });
            } else {
                // Tab doesn't exist, create it
                chrome.tabs.create({ url: "https://masar.nusuk.sa/pub/login" }, (tab) => {
                    // Wait for it to load then send data
                    // Note: simple listener for tab update might be better
                    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                        if (tabId === tab.id && info.status === 'complete') {
                            chrome.tabs.sendMessage(tabId, {
                                target: 'NUSUK_CONTENT',
                                type: 'DO_LOGIN',
                                payload
                            });
                            chrome.tabs.onUpdated.removeListener(listener);
                        }
                    });
                });
            }
        });
    }
}

// Listen for status updates from Content Script (Nusuk) and relay to App (Localhost)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target === 'NUSUK_STATUS_UPDATE') {
        const statusData = message.payload;

        // Find the React App tab (localhost)
        // We look for tabs matching our patterns
        chrome.tabs.query({ url: ["http://localhost:*/*", "http://127.0.0.1:*/*"] }, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    target: 'NUSUK_EXTENSION_PROXY_RECEIVE', // Proxy will listen for this
                    payload: statusData
                });
            });
        });
    }
});
