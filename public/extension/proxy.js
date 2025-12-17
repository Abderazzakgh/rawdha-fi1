// proxy.js
// Runs on the React App (Localhost) to bridge window messages to the extension background

console.log('[Nusuk Bridge] Proxy script loaded on ', window.location.href);

// Announce presence so React app knows extension is installed
window.postMessage({ type: 'NUSUK_EXTENSION_READY' }, '*');

window.addEventListener('message', (event) => {
    // Only accept messages from the same window
    if (event.source !== window) return;

    if (event.data.target === 'NUSUK_EXTENSION_PROXY') {
        console.log('[Nusuk Bridge] Proxy received:', event.data);
        // Relay to background
        chrome.runtime.sendMessage({
            target: 'NUSUK_EXTENSION_BG',
            data: event.data.payload
        });
    }
});

// Listen for messages FROM background (Status updates)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target === 'NUSUK_EXTENSION_PROXY_RECEIVE') {
        // Forward to the Window (React App)
        window.postMessage({
            type: 'NUSUK_EXT_STATUS',
            payload: message.payload
        }, '*');
    }
});
