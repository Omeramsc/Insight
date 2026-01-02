/**
 * Calls the Gemini API to generate content.
 * @param {Array} contents - The conversation history (array of objects with role and parts).
 * @param {string} apiKey - The Gemini API key.
 * @param {string} model - The model to use (e.g., 'gemini-2.5-flash').
 * @returns {Promise<string>} - The generated text response.
 */
async function callGemini(contents, apiKey, model = 'gemini-2.5-flash') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: contents
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();

        // Extract text from response
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts.map(part => part.text).join('');
        } else {
            return "No response generated.";
        }

    } catch (error) {
        console.error("API Call Failed:", error);
        throw error;
    }
}

module.exports = {
    callGemini
};
