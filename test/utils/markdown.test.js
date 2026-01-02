const { parseMarkdown } = require('../../src/utils/markdown.js');

describe('parseMarkdown', () => {
    test('converts headers correctly', () => {
        expect(parseMarkdown('## Header 2')).toBe('<h2>Header 2</h2>');
        expect(parseMarkdown('### Header 3')).toBe('<h3>Header 3</h3>');
    });

    test('converts bold text', () => {
        expect(parseMarkdown('**bold**')).toBe('<p><strong>bold</strong></p>');
    });

    test('converts italic text', () => {
        expect(parseMarkdown('*italic*')).toBe('<p><em>italic</em></p>');
    });

    test('converts lists', () => {
        const input = '- Item 1\n* Item 2';
        const expected = '<ul><li>Item 1</li></ul><ul><li>Item 2</li></ul>';
        expect(parseMarkdown(input)).toBe(expected);
    });

    test('handles paragraphs', () => {
        const input = 'Line 1\nLine 2';
        const expected = '<p>Line 1</p><p>Line 2</p>';
        expect(parseMarkdown(input)).toBe(expected);
    });

    test('returns empty string for empty input', () => {
        expect(parseMarkdown(null)).toBe('');
        expect(parseMarkdown('')).toBe('');
    });
});
