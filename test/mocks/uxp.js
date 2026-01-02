const storage = {
    localFileSystem: {
        getTemporaryFolder: jest.fn().mockResolvedValue({
            createFile: jest.fn().mockResolvedValue({
                read: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
                delete: jest.fn()
            })
        })
    },
    formats: {
        binary: 'binary'
    }
};

module.exports = {
    storage
};
