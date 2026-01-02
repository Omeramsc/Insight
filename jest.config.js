module.exports = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^photoshop$': '<rootDir>/test/mocks/photoshop.js',
        '^uxp$': '<rootDir>/test/mocks/uxp.js'
    },
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    // Since we are not using Babel explicitly, we rely on Jest's default behavior for CommonJS
    // If we were using ES modules, we'd need more config.
    // Given the project uses require(), defaults should work.
};
