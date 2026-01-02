const globals = require('globals');
const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                'sp-progress-circle': 'readonly',
                'jest': 'readonly',
                'describe': 'readonly',
                'test': 'readonly',
                'expect': 'readonly',
                'it': 'readonly',
                'beforeEach': 'readonly',
                'afterEach': 'readonly',
                'beforeAll': 'readonly',
                'afterAll': 'readonly'
            }
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'warn',
            'no-console': 'off',
            'semi': ['error', 'always'],
            'quotes': ['error', 'single']
        }
    }
];
