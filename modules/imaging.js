const { app, core } = require('photoshop');
const fs = require('uxp').storage.localFileSystem;
const formats = require('uxp').storage.formats;

/**
 * Captures the current active document as a base64 string.
 * Resizes the image if it exceeds the maxSize (long edge).
 * @param {number} maxSize - Maximum pixel length for the long edge (default 3000).
 */
async function getCurrentImage(maxSize = 3000) {
    return await core.executeAsModal(async () => {
        let docToSave = null;
        let tempDocCreated = false;

        try {
            const appDoc = app.activeDocument;
            if (!appDoc) {
                throw new Error("No active document found. Please open an image.");
            }

            // Check dimensions
            const width = appDoc.width;
            const height = appDoc.height;
            const longEdge = Math.max(width, height);
            console.log(`Original Image Size: ${width}x${height}`);

            if (longEdge > maxSize) {
                console.log(`Image is too large (${longEdge}px). Resizing to ${maxSize}px...`);
                // Duplicate the document to avoid modifying the original
                try {
                    docToSave = await appDoc.duplicate("gemini_temp_resize");
                    tempDocCreated = true;
                    console.log("Document duplicated.");
                } catch (dupErr) {
                    console.error("Duplicate failed:", dupErr);
                    // Fallback: use original if duplicate fails (risky but better than crash)
                    docToSave = appDoc;
                }

                if (tempDocCreated) {
                    // Calculate new dimensions
                    const ratio = maxSize / longEdge;
                    const newWidth = Math.round(width * ratio);
                    const newHeight = Math.round(height * ratio);
                    console.log(`Resizing to ${newWidth}x${newHeight}...`);

                    // Resize the duplicate
                    await docToSave.resizeImage(newWidth, newHeight);
                    console.log("Resize complete.");
                }
            } else {
                docToSave = appDoc;
            }

            // 1. Create a temporary file
            console.log("Creating temp file...");
            const tempFolder = await fs.getTemporaryFolder();
            const tempFile = await tempFolder.createFile("gemini_temp_scan.jpg", { overwrite: true });

            // 2. Save the document to the temporary file
            console.log("Saving to temp file...");
            await docToSave.saveAs.jpg(tempFile, { quality: 8 }, true);
            console.log("Save complete.");

            // 3. Read the file as binary
            console.log("Reading file...");
            const data = await tempFile.read({ format: formats.binary });
            console.log("Read complete.");

            // 4. Convert binary data to base64 string
            const base64String = base64ArrayBuffer(data);

            // 5. Clean up file
            await tempFile.delete();

            // 6. Return formatted base64 string
            return `data:image/jpeg;base64,${base64String}`;

        } catch (e) {
            console.error("Error in getCurrentImage:", e);
            throw e;
        } finally {
            // Close the temporary duplicate if we created one
            if (tempDocCreated && docToSave) {
                try {
                    await docToSave.closeWithoutSaving();
                } catch (closeErr) {
                    console.error("Error closing temp document:", closeErr);
                }
            }
        }
    }, { commandName: "Scanning Image for Gemini" });
}

// Helper function to convert ArrayBuffer to Base64
function base64ArrayBuffer(arrayBuffer) {
    let base64 = '';
    const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    const bytes = new Uint8Array(arrayBuffer);
    const byteLength = bytes.byteLength;
    const byteRemainder = byteLength % 3;
    const mainLength = byteLength - byteRemainder;

    let a, b, c, d;
    let chunk;

    // Main loop deals with bytes in chunks of 3
    for (let i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
        d = chunk & 63;               // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength];

        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4; // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

        a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2; // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }

    return base64;
}

module.exports = {
    getCurrentImage
};
