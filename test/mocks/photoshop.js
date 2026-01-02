const app = {
    activeDocument: {
        width: 1000,
        height: 1000,
        duplicate: jest.fn().mockResolvedValue({
            resizeImage: jest.fn(),
            saveAs: {
                jpg: jest.fn()
            },
            closeWithoutSaving: jest.fn()
        }),
        saveAs: {
            jpg: jest.fn()
        }
    }
};

const core = {
    executeAsModal: jest.fn(async (callback) => {
        return await callback();
    })
};

module.exports = {
    app,
    core
};
