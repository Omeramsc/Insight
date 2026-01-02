/**
 * Parses markdown text into HTML.
 * @param {string} text - The markdown text.
 * @returns {string} The HTML string.
 */
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

module.exports = { parseMarkdown };
