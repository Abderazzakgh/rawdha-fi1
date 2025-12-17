// nusuk-interceptor.js
// Runs on masar.nusuk.sa

console.log('[Nusuk Bridge] Interceptor loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target === 'NUSUK_CONTENT') {
        console.log('[Nusuk Bridge] Content received:', message);

        if (message.type === 'DO_LOGIN') {
            performLogin(message.payload);
        } else if (message.type === 'DO_NAVIGATE') {
            performNavigation(message.payload);
        }
    } else if (message.type === 'START_SCANNING') {
        startScanning(message.payload);
    } else if (message.type === 'STOP_SCANNING') {
        stopScanning();
    }
});

let scanningInterval = null;

function startScanning({ retryDelay }) {
    console.log('[Nusuk Bridge] Starting scan loop...');
    if (scanningInterval) clearInterval(scanningInterval);

    scanningInterval = setInterval(() => {
        scanAndBook();
    }, (retryDelay || 5) * 1000);

    // Immediate first run
    scanAndBook();
}

function stopScanning() {
    console.log('[Nusuk Bridge] Stopping scan loop');
    if (scanningInterval) clearInterval(scanningInterval);
    scanningInterval = null;
}

// Selectors should be refined based on actual site inspection
// Assuming standard text matching for buttons as fallback

function performNavigation(data) {
    const action = data?.action;

    switch (action) {
        case 'CLICK_PERMITS':
            findAndClickByText(['التصاريح', 'Permits', 'تصاريح نسك']);
            break;

        case 'CLICK_ADD_REQUEST':
            findAndClickByText(['إضافة طلب تصريح', 'Add Request', 'طلب جديد']);
            break;

        case 'CLICK_MEN_PERMIT':
            findAndClickByText(['الروضة الشريفة للرجال', 'Rawdha Men']);
            break;

        case 'CLICK_WOMEN_PERMIT':
            findAndClickByText(['الروضة الشريفة للنساء', 'Rawdha Women']);
            break;

        case 'CLICK_FILTER':
            console.log('[Nusuk Bridge] Filtering by group number:', data?.groupNumber);
            const groupField = findFieldByStrategies([
                { type: 'placeholder', val: 'number', lang: 'en' },
                { type: 'placeholder', val: 'عدد', lang: 'ar' }, // "عدد الزوار"
                { type: 'selector', val: 'input[type="number"]' },
                { type: 'selector', val: '[aria-label*="count"]' },
                { type: 'selector', val: '[aria-label*="عدد"]' }
            ]);

            if (groupField) {
                // Try to clear it first if possible
                groupField.value = '';
                simulateTyping(groupField, data.groupNumber || "1");
                console.log('[Nusuk Bridge] Group number set.');
            } else {
                console.warn('[Nusuk Bridge] Group number input not found.');
            }
            break;

        case 'CLICK_SELECT_PEOPLE':
            // If there's a specific "Select All" or people checkboxes
            const selectAll = findElementByContent('div, span, button', ['تحديد الكل', 'Select All']);
            if (selectAll) {
                selectAll.click();
                console.log('[Nusuk Bridge] Selected all visitors.');
            } else {
                // Fallback: Click first N checkboxes?
                // For now just warn
                console.warn('[Nusuk Bridge] Select All button not found.');
            }
            break;
    }
}

async function scanAndBook() {
    console.log('[Nusuk Bridge] Scanning for slots...');
    sendStatus('INFO', 'Scanning for available slots...');

    // 1. Look for available days
    // Enhanced selector strategy
    const daySelectors = [
        '.day.available',
        '.day-green',
        '[aria-label*="available"]',
        '[aria-label*="متاح"]',
        'button.day-box:not([disabled])'
    ];

    let availableDays = document.querySelectorAll(daySelectors.join(', '));

    if (availableDays.length > 0) {
        console.log('[Nusuk Bridge] Found available days:', availableDays.length);
        sendStatus('INFO', `Found ${availableDays.length} available days! Processing...`);

        // Highlight found day
        const dayToClick = availableDays[0];
        dayToClick.style.border = '2px solid #00AA00';
        dayToClick.click();

        // Wait for times to load (using our robust waiter)
        try {
            // Wait for time slots container or buttons
            // Identify time slots by class or content (format like 12:30)
            await waitForElement('.time-slot, button.time-btn, [class*="time"]');

            // 2. Look for specific time slots
            const timeSlots = Array.from(document.querySelectorAll('button, div.time-slot')).filter(el => {
                const text = el.innerText || el.textContent;
                return /\d{1,2}:\d{2}/.test(text) && !el.classList.contains('disabled') && !el.disabled;
            });

            if (timeSlots.length > 0) {
                console.log('[Nusuk Bridge] Found time slots:', timeSlots.length);
                sendStatus('STATUS_FOUND_SLOT', `Found ${timeSlots.length} time slots! Attempting booking...`);

                const timeToClick = timeSlots[0];
                timeToClick.style.border = '2px solid #00AA00';
                timeToClick.click();

                // 3. Click Continue/Book
                // Wait for button to be enabled/visible
                setTimeout(() => {
                    const continueBtn = findElementByContent('button', ['استمرار', 'Continue', 'Book', 'حجز', 'تأكيد', 'Confirm']) ||
                        document.querySelector('button[type="submit"]');

                    if (continueBtn) {
                        console.log('[Nusuk Bridge] Booking/Continue button found. CLICKING!');
                        continueBtn.style.border = '3px solid #ff0000'; // Make it very visible
                        continueBtn.click();
                        sendStatus('INFO', 'Booking button clicked. Waiting for confirmation...');
                        stopScanning();
                    } else {
                        console.warn('[Nusuk Bridge] Continue button not found after time selection.');
                        sendStatus('ERROR', 'Time removed or expired before clicking book.');
                    }
                }, 800);
            } else {
                console.log('[Nusuk Bridge] No valid time slots found after day click.');
                sendStatus('INFO', 'Days found but no valid times matched.');
            }
        } catch (e) {
            console.log('[Nusuk Bridge] Parsing time slots timed out or failed.', e);
        }
    } else {
        console.log('[Nusuk Bridge] No slots found, retrying...');
        sendStatus('INFO', 'No slots found. Retrying...');
        // Logic to switch weeks could go here
    }
}

function findAndClickByText(texts) {
    const elements = document.querySelectorAll('button, a, span, div'); // Broad search
    for (let el of elements) {
        if (texts.some(t => el.textContent.includes(t)) && el.offsetParent !== null) { // Visible check
            console.log('Found element:', el);
            el.click();
            return true;
        }
    }
    console.warn('Element not found for:', texts);
    return false;
}

async function performLogin({ username, password }) {
    console.log('[Nusuk Bridge] Attempting robust login...');
    sendStatus('INFO', 'Checking for existing session...');

    // 1. Smart Session Check
    if (await checkIsLoggedIn()) {
        console.log('[Nusuk Bridge] Already logged in. Skipping login.');
        sendStatus('STATUS_LOGIN_SUCCESS', 'Session active! Redirecting to permits...');
        // Auto-navigate to permits
        performNavigation({ action: 'CLICK_PERMITS' });
        return;
    }

    console.log('[Nusuk Bridge] Waiting for login page readiness...');

    // 2. Wait for key elements to ensure page is loaded
    try {
        await waitForElement('input', 10000);
    } catch (e) {
        console.error('[Nusuk Bridge] Timeout waiting for inputs. Page might be stuck.');
        sendStatus('ERROR', 'Timeout waiting for login page.');
        return;
    }

    // 3. Find Username Field
    const userField = findFieldByStrategies([
        { type: 'selector', val: 'input[name="username"]' },
        { type: 'selector', val: 'input[autocomplete="username"]' },
        { type: 'placeholder', val: 'identity', lang: 'en' },  // "National ID / Iqama"
        { type: 'placeholder', val: 'هوية', lang: 'ar' },      // "رقم الهوية / الإقامة"
        { type: 'selector', val: 'input[type="text"]' }        // Fallback: First text input
    ]);

    // 4. Find Password Field
    const passField = findFieldByStrategies([
        { type: 'selector', val: 'input[name="password"]' },
        { type: 'selector', val: 'input[autocomplete="current-password"]' },
        { type: 'placeholder', val: 'password', lang: 'en' },
        { type: 'placeholder', val: 'كلمة', lang: 'ar' },
        { type: 'selector', val: 'input[type="password"]' }
    ]);

    if (userField && passField) {
        console.log('[Nusuk Bridge] Fields found. Filling data...');
        sendStatus('INFO', 'Filling credentials...');

        // Highlight found fields for debug visibility
        userField.style.border = '2px solid #00AA00';
        passField.style.border = '2px solid #00AA00';

        // React-friendly value setting
        await simulateTyping(userField, username);
        await new Promise(r => setTimeout(r, 200)); // Small pause
        await simulateTyping(passField, password);

        // 5. Find and Click Login Button
        // Search for button with specific text or type
        const submitBtn = findElementByContent('button', ['تسجيل', 'Login', 'دخول', 'Sign in']) ||
            document.querySelector('button[type="submit"]');

        if (submitBtn) {
            console.log('[Nusuk Bridge] Submit button found. Clicking...');
            submitBtn.style.border = '2px solid #00AA00';

            setTimeout(() => {
                submitBtn.click();
                // Start watching for OTP or Success
                waitForOTPOrDashboard();
            }, 800);
        } else {
            console.warn('[Nusuk Bridge] Login button NOT found. Attempting generic enter key...');
            // Fallback: Press Enter on password field
            passField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            waitForOTPOrDashboard();
        }

    } else {
        console.error('[Nusuk Bridge] CRITICAL: Login fields not found!', { userField, passField });
        sendStatus('ERROR', 'Login fields not found');
    }
}

// --- Smart Login Helpers ---

async function checkIsLoggedIn() {
    // Check for elements that only exist when logged in
    const dashboardElements = [
        'a[href*="logout"]',
        'button[class*="user"]',
        '.dashboard-menu',
        'a[href*="permits"]'
    ];

    // Quick check
    if (document.querySelector(dashboardElements.join(', '))) return true;

    // Check for "Permits" text
    if (findElementByContent('a, button, span', ['Permits', 'التصاريح', 'لوحة التحكم', 'Dashboard'])) {
        return true;
    }

    return false;
}

function waitForOTPOrDashboard() {
    sendStatus('INFO', 'Credentials submitted. Waiting for response...');

    let checks = 0;
    const interval = setInterval(async () => {
        checks++;

        // 1. Check for OTP
        if (document.querySelector('input[autocomplete="one-time-code"]') ||
            findElementByContent('h1, h2, h3, div', ['Verification', 'رمز التحقق', 'OTP'])) {

            clearInterval(interval);
            console.log('[Nusuk Bridge] OTP Screen Detected!');
            sendStatus('STATUS_OTP_NEEDED', 'Please enter the verification code sent to your phone.');
            return;
        }

        // 2. Check for Dashboard (Login Success)
        if (await checkIsLoggedIn()) {
            clearInterval(interval);
            console.log('[Nusuk Bridge] Login Successful!');
            sendStatus('STATUS_LOGIN_SUCCESS', 'Login successful! Redirecting...');
            // Chain: Go to Permits
            setTimeout(() => performNavigation({ action: 'CLICK_PERMITS' }), 1000);
            return;
        }

        // 3. Check for Errors
        const errorMsg = document.querySelector('.error-message, .alert-danger, [role="alert"]');
        if (errorMsg) {
            clearInterval(interval);
            console.log('[Nusuk Bridge] Login Error:', errorMsg.innerText);
            sendStatus('ERROR', `Login Failed: ${errorMsg.innerText}`);
            return;
        }

        if (checks > 20) { // 20 seconds timeout
            clearInterval(interval);
            console.log('[Nusuk Bridge] Login wait timeout.');
            sendStatus('INFO', 'Still waiting... Please check manually.');
        }
    }, 1000);
}

// --- Communication Helpers ---

function sendStatus(type, message, extraData = {}) {
    console.log(`[Nusuk Bridge] STATUS: ${type} - ${message}`);

    // Update Visual Badge
    if (type === 'ERROR') updateBadgeStatus(message, '#ff4444');
    else if (type === 'STATUS_FOUND_SLOT') updateBadgeStatus(message, '#4ade80');
    else updateBadgeStatus(message, '#ccc');

    try {
        chrome.runtime.sendMessage({
            target: 'NUSUK_STATUS_UPDATE', // New target for background to catch
            payload: {
                type,
                message,
                timestamp: Date.now(),
                ...extraData
            }
        });
    } catch (e) {
        console.warn('Failed to send status (extension context invalidated?)', e);
    }
}

// --- Helper Functions ---

function findFieldByStrategies(strategies) {
    for (let strategy of strategies) {
        let element = null;
        if (strategy.type === 'selector') {
            element = document.querySelector(strategy.val);
        } else if (strategy.type === 'placeholder') {
            element = Array.from(document.querySelectorAll('input')).find(el =>
                el.placeholder && el.placeholder.toLowerCase().includes(strategy.val)
            );
        }

        if (element && element.offsetParent !== null) { // Check visibility
            console.log(`[Nusuk Bridge] Found field via strategy: ${strategy.type} - ${strategy.val}`);
            return element;
        }
    }
    return null;
}

function findElementByContent(tag, texts) {
    const elements = document.querySelectorAll(tag);
    for (let el of elements) {
        if (el.offsetParent === null) continue; // Skip hidden

        const text = el.textContent || el.innerText || el.value;
        if (text && texts.some(t => text.toLowerCase().includes(t.toLowerCase()))) {
            return el;
        }
    }
    return null;
}

// Robust value setter for React/Angular/Vue
async function simulateTyping(element, text) {
    element.focus();
    setNativeValue(element, text);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
}

function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout waiting for ${selector}`));
        }, timeout);
    });
}

function monitorLoginResult() {
    // Watch for error messages after submission
    setTimeout(() => {
        const errorMsg = document.querySelector('.error-message, .alert-danger, [role="alert"]');
        if (errorMsg) {
            console.log('[Nusuk Bridge] Login Error Detected:', errorMsg.innerText);
            // Could send message back to app here
        } else {
            console.log('[Nusuk Bridge] No immediate error detected. Assuming transition to OTP or Dashboard.');
        }
    }, 2000);
}

// Helper to set value on React inputs
function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
}

// --- Visual Verification Helpers ---

function injectStatusBadge() {
    if (document.getElementById('nusuk-auto-badge')) return;

    const badge = document.createElement('div');
    badge.id = 'nusuk-auto-badge';
    badge.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="height: 10px; width: 10px; background-color: #4ade80; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #4ade80;"></span>
            <span style="font-family: sans-serif; font-weight: bold;">Rawdha Automation: Active</span>
        </div>
        <div id="nusuk-badge-status" style="font-size: 10px; color: #ccc; margin-top: 4px;">Waiting for commands...</div>
    `;
    badge.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        z-index: 999999;
        font-size: 14px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        pointer-events: none;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(74, 222, 128, 0.5);
        border: 1px solid rgba(74, 222, 128, 0.2);
        backdrop-filter: blur(8px);
        transition: all 0.3s ease;
        direction: ltr; /* Always LTR for badge */
        min-width: 250px;
    `;
    document.body.appendChild(badge);
}

// Update the badge text
function updateBadgeStatus(text, color = '#ccc') {
    const el = document.getElementById('nusuk-badge-status');
    if (el) {
        el.innerText = text;
        el.style.color = color;
    }
}

// Inject immediately on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStatusBadge);
} else {
    injectStatusBadge();
}
