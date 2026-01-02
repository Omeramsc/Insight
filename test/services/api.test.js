const { callGemini } = require('../../src/services/api.js');

// Mock global fetch
// global.fetch = jest.fn(); // Removed -> We inject it now
const fetch = jest.fn();

describe('callGemini', () => {
    beforeEach(() => {
        fetch.mockClear();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    test('calls API with correct parameters', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                candidates: [{ content: { parts: [{ text: 'Response' }] } }]
            })
        });

        const history = [{ role: 'user', parts: [{ text: 'Hello' }] }];
        const apiKey = 'test-key';
        const model = 'gemini-test';

        await callGemini(history, apiKey, model, { fetchImpl: fetch });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('gemini-test:generateContent'),
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: expect.stringContaining('"text":"Hello"')
            })
        );
    });

    test('returns generated text', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                candidates: [{ content: { parts: [{ text: 'Gemini Response' }] } }]
            })
        });

        const response = await callGemini([], 'key', 'gemini-test', { fetchImpl: fetch });
        expect(response).toBe('Gemini Response');
    });

    test('throws error on API failure', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Bad Request',
            json: async () => ({ error: { message: 'Invalid Key' } })
        });

        await expect(callGemini([], 'key', 'gemini-test', { fetchImpl: fetch })).rejects.toThrow('Gemini API Error: Invalid Key');
    });
});
