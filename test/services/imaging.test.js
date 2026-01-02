const { getCurrentImage } = require('../../src/services/imaging.js');
const { app, core } = require('photoshop');
const { storage } = require('uxp');

describe('getCurrentImage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('throws error if no active document', async () => {
        // Temporarily set activeDocument to null
        const originalDoc = app.activeDocument;
        delete app.activeDocument;

        await expect(getCurrentImage(3000, { photoshop: { app, core }, uxp: { storage } })).rejects.toThrow('No active document');

        // Restore
        app.activeDocument = originalDoc;
    });

    test('resizes image if too large', async () => {
        app.activeDocument.width = 4000;
        app.activeDocument.height = 3000;

        await getCurrentImage(3000, { photoshop: { app, core }, uxp: { storage } });

        expect(app.activeDocument.duplicate).toHaveBeenCalled();
        // Check if resize was called on the duplicated doc (which is the resolved value of duplicate)
        const mockDupDoc = await app.activeDocument.duplicate.mock.results[0].value;
        expect(mockDupDoc.resizeImage).toHaveBeenCalled();
    });

    test('does not resize if small enough', async () => {
        app.activeDocument.width = 1000;
        app.activeDocument.height = 1000;

        await getCurrentImage(3000, { photoshop: { app, core }, uxp: { storage } });

        expect(app.activeDocument.duplicate).not.toHaveBeenCalled();
    });

    test('saves and reads file', async () => {
        const result = await getCurrentImage(3000, { photoshop: { app, core }, uxp: { storage } });

        expect(storage.localFileSystem.getTemporaryFolder).toHaveBeenCalled();
        expect(app.activeDocument.saveAs.jpg).toHaveBeenCalled();
        expect(result).toContain('data:image/jpeg;base64,');
    });
});
