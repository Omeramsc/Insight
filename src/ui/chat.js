const { parseMarkdown } = require('../utils/markdown.js');

/**
 * Scrolls the chat container to the bottom.
 * @param {HTMLElement} container - The chat history container.
 */
function scrollToBottom(container) {
    // Timeout is required in UXP to allow layout to refresh first
    setTimeout(() => {
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, 100);
}

/**
 * Adds a message to the chat UI.
 * @param {HTMLElement} container - The chat history container.
 * @param {string} role - 'user' or 'model'.
 * @param {string} text - The message text.
 */
function addMessageToUI(container, role, text) {
    if (!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role);
    msgDiv.innerHTML = parseMarkdown(text);
    container.appendChild(msgDiv);
    scrollToBottom(container);
}

module.exports = { scrollToBottom, addMessageToUI };
