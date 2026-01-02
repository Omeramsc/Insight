const { callGemini } = require('./modules/api.js');
const { getCurrentImage } = require('./modules/imaging.js');
const { getMockResponse } = require('./modules/mock.js');

document.addEventListener('DOMContentLoaded', () => {
    console.log("Gemini Critique Plugin Loaded");

    // --- UI ELEMENTS ---
    const apiKeyInput = document.getElementById('api-key');
    const modelSelect = document.getElementById('model-select');
    const saveSettingsBtn = document.getElementById('save-settings');
    const scanBtn = document.getElementById('scan-critique-btn');
    const loadingIndicator = document.getElementById('loading');

    const promptInput = document.getElementById('prompt-input');
    const chatContainer = document.getElementById('chat-container');
    const chatHistoryDiv = document.getElementById('chat-history');
    const chatInput = document.getElementById('chat-input');
    const sendReplyBtn = document.getElementById('send-reply-btn');
    const newScanBtn = document.getElementById('new-scan-btn');

    let chatHistory = [];

    // --- LOAD SETTINGS ---
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey && apiKeyInput) apiKeyInput.value = savedKey;

    const savedModel = localStorage.getItem('gemini_model');
    if (savedModel && modelSelect) modelSelect.value = savedModel;

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            localStorage.setItem('gemini_api_key', apiKeyInput.value);
            localStorage.setItem('gemini_model', modelSelect.value);
            saveSettingsBtn.textContent = "Saved!";
            setTimeout(() => saveSettingsBtn.textContent = "Save Settings", 2000);
        });
    }

    // --- HELPER: MARKDOWN PARSER ---
    function parseMarkdown(text) {
        if (!text) return "";
        // Headers
        let html = text
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic

        // Paragraphs (Split by newline and wrap)
        return html.split('\n').map(line => {
            line = line.trim();
            if (line === '') return '';
            if (line.startsWith('- ') || line.startsWith('* ')) {
                return `<ul><li>${line.substring(2)}</li></ul>`;
            }
            return `<p>${line}</p>`;
        }).join('');
    }

    // --- HELPER: SCROLL TO BOTTOM ---
    function scrollToBottom() {
        // Timeout is required in UXP to allow layout to refresh first
        setTimeout(() => {
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        }, 100);
    }

    function addMessageToUI(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', role);
        msgDiv.innerHTML = parseMarkdown(text);
        chatHistoryDiv.appendChild(msgDiv);
        scrollToBottom();
    }

    // --- MAIN ACTION: SCAN ---
    if (scanBtn) {
        scanBtn.addEventListener('click', async () => {
            const apiKey = localStorage.getItem('gemini_api_key');
            // Default to 2.0-flash if nothing saved
            const model = localStorage.getItem('gemini_model') || 'gemini-2.0-flash';

            if (!apiKey && model !== 'mock-model') {
                alert('Please enter your API Key in settings.');
                return;
            }

            // UI Reset
            chatHistory = [];
            chatHistoryDiv.innerHTML = '';
            chatContainer.classList.remove('hidden');
            loadingIndicator.classList.remove('hidden');

            // Hide Start Screen
            document.querySelector('.prompt-section').classList.add('hidden');
            scanBtn.classList.add('hidden');
            document.querySelector('.description').classList.add('hidden');

            try {
                console.log("Getting image...");
                const imageBase64 = await getCurrentImage();
                const userPrompt = promptInput.value;

                // Add user message to UI
                addMessageToUI('user', userPrompt);

                // Prepare API Payload
                let mimeType = "image/jpeg";
                if (imageBase64.includes("image/png")) mimeType = "image/png";

                const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

                const userMessage = {
                    role: 'user',
                    parts: [
                        { text: userPrompt },
                        { inline_data: { mime_type: mimeType, data: base64Data } }
                    ]
                };
                chatHistory.push(userMessage);

                // Call API or Mock
                let responseText;
                if (model === 'mock-model') {
                    console.log("Using Mock Model...");
                    responseText = await getMockResponse();
                } else {
                    console.log(`Calling Gemini API (${model})...`);
                    responseText = await callGemini(chatHistory, apiKey, model);
                }

                // Handle Response
                chatHistory.push({ role: 'model', parts: [{ text: responseText }] });
                addMessageToUI('model', responseText);

                // Enable Reply
                chatInput.disabled = false;
                sendReplyBtn.disabled = false;
                chatInput.focus();

            } catch (error) {
                console.error(error);
                addMessageToUI('model', `Error: ${error.message}`);
                // Show controls again on error so user can retry
                document.querySelector('.prompt-section').classList.remove('hidden');
                scanBtn.classList.remove('hidden');
            } finally {
                loadingIndicator.classList.add('hidden');
            }
        });
    }

    // --- MAIN ACTION: REPLY ---
    async function sendReply() {
        const text = chatInput.value.trim();
        if (!text) return;

        const apiKey = localStorage.getItem('gemini_api_key');
        const model = localStorage.getItem('gemini_model') || 'gemini-2.0-flash';

        // Disable input immediately
        chatInput.value = '';
        chatInput.disabled = true;
        loadingIndicator.classList.remove('hidden');

        try {
            // Capture Image for every reply
            console.log("Capturing updated image for reply...");
            const imageBase64 = await getCurrentImage();

            let mimeType = "image/jpeg";
            if (imageBase64.includes("image/png")) mimeType = "image/png";
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

            // Add to UI
            addMessageToUI('user', text + " <br><small><i>(Sent with updated image)</i></small>");

            // Add to History with Image
            chatHistory.push({
                role: 'user',
                parts: [
                    { text: text },
                    { inline_data: { mime_type: mimeType, data: base64Data } }
                ]
            });

            let responseText;
            if (model === 'mock-model') {
                console.log("Using Mock Model (Reply)...");
                responseText = await getMockResponse();
            } else {
                console.log(`Calling Gemini API (${model})...`);
                responseText = await callGemini(chatHistory, apiKey, model);
            }

            chatHistory.push({ role: 'model', parts: [{ text: responseText }] });
            addMessageToUI('model', responseText);
        } catch (error) {
            console.error(error);
            addMessageToUI('model', `Error: ${error.message}`);
        } finally {
            chatInput.disabled = false;
            loadingIndicator.classList.add('hidden');
            chatInput.focus();
        }
    }

    if (sendReplyBtn) {
        sendReplyBtn.addEventListener('click', sendReply);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendReply();
        });
    }

    if (newScanBtn) {
        newScanBtn.addEventListener('click', () => {
            chatContainer.classList.add('hidden');
            document.querySelector('.prompt-section').classList.remove('hidden');
            scanBtn.classList.remove('hidden');
            document.querySelector('.description').classList.remove('hidden');
            chatHistory = [];
            chatHistoryDiv.innerHTML = '';
        });
    }
});