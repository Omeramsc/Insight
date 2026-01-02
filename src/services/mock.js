/**
 * Generates a mock response for debugging.
 * Randomly returns either a short or long response to test UI layout.
 */
async function getMockResponse() {
    // Simulate network delay (0.5 to 1.5 seconds)
    const delay = Math.floor(Math.random() * 1000) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    const isLong = Math.random() > 0.5; // 50/50 chance

    if (isLong) {
        return `### **Mock Analysis (Long Version)**
This response is designed to test **scrolling behavior**, *markdown parsing*, and flexbox layout stability.

*   **Integration:** The subject is well integrated but the shadows are wrong.
*   **Lighting:** Global illumination is cool, but local light is warm.
*   **Color:** The palette is split-complementary.

Here is a long paragraph to ensure that text wrapping is functioning correctly. If the CSS is broken, this text might spill out of the bubble, overlap with other messages, or cause the chat window to expand infinitely instead of scrolling. We need to ensure \`flex-shrink: 0\` is working on the message container.

#### Action Plan
1.  **Darken** the background by 20%.
2.  **Add** a rim light to the left.
3.  **Desaturate** the reds in the foreground.`;
    } else {
        return `### **Mock Analysis (Short)**
*   **Verdict:** Great photo!
*   **Fix:** Just lower the exposure slightly.`;
    }
}

module.exports = {
    getMockResponse
};