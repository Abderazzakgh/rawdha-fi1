export const ExtensionBridge = {
    isAvailable: false,
    statusListeners: [] as ((status: any) => void)[],

    init() {
        // Listen for the "I am here" message from proxy.js
        window.addEventListener('message', (event) => {
            if (event.data?.type === 'NUSUK_EXTENSION_READY') {
                console.log('Extension Bridge Detected!');
                this.isAvailable = true;
            } else if (event.data?.type === 'NUSUK_EXT_STATUS') {
                // Determine if this is a status update
                this.statusListeners.forEach(listener => listener(event.data.payload));
            }
        });
    },

    onStatusUpdate(callback: (status: any) => void) {
        this.statusListeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== callback);
        };
    },

    login(credentials: { username: string; password_encrypted: string }) {
        if (!this.isAvailable) {
            console.warn('Extension not available. Please install the bridge extension.');
            return false;
        }

        // Send formatted message to our proxy content script
        window.postMessage({
            target: 'NUSUK_EXTENSION_PROXY',
            payload: {
                type: 'OPEN_AND_LOGIN',
                payload: {
                    username: credentials.username,
                    password: credentials.password_encrypted // Interceptor will decrypt or just use
                }
            }
        }, '*');

        return true;
    },

    navigate(action: 'CLICK_PERMITS' | 'CLICK_ADD_REQUEST' | 'CLICK_MEN_PERMIT' | 'CLICK_WOMEN_PERMIT' | 'CLICK_FILTER' | 'CLICK_SELECT_PEOPLE', data?: any) {
        if (!this.isAvailable) return false;

        window.postMessage({
            target: 'NUSUK_EXTENSION_PROXY',
            payload: {
                type: 'DO_NAVIGATE',
                payload: { action, data }
            }
        }, '*');
        return true;
    },

    startScanning(options: { retryDelay: number }) {
        if (!this.isAvailable) return false;

        window.postMessage({
            target: 'NUSUK_EXTENSION_PROXY',
            payload: {
                type: 'START_SCANNING',
                payload: options
            }
        }, '*');
        return true;
    },

    stopScanning() {
        if (!this.isAvailable) return false;

        window.postMessage({
            target: 'NUSUK_EXTENSION_PROXY',
            payload: {
                type: 'STOP_SCANNING',
                payload: {}
            }
        }, '*');
        return true;
    }
};

// Start listening immediately
ExtensionBridge.init();
