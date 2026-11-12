import js from '@eslint/js'
import eslintReact from '@eslint-react/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import regex from 'eslint-plugin-regex'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import globals from 'globals'

export default [
    {
        ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
    },

    js.configs.recommended,

    // React rules (keys, fragments, hooks misuse, etc.) for TypeScript projects
    eslintReact.configs['recommended-typescript'],

    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parser: typescriptParser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            '@typescript-eslint': typescript,
            regex,
            'better-tailwindcss': eslintPluginBetterTailwindcss,
        },
        settings: {
            'better-tailwindcss': {
                entryPoint: `${import.meta.dirname}/src/index.css`,
            },
        },
        rules: {
            // JS
            'prefer-arrow-callback': 'warn',

            // TS
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',

            // Regex
            'regex/invalid': [
                'warn',
                [
                    {
                        regex: 'console\\.log',
                        files: { inspect: 'src' },
                        message: 'Leftover `console.log`.',
                    },
                    {
                        regex: 'TODO',
                        files: { inspect: 'src' },
                        message: 'Leftover `TODO`.',
                    },
                ],
            ],

            // React
            '@eslint-react/no-duplicate-key': 'warn',
            '@eslint-react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],

            ...reactHooks.configs.recommended.rules,

            // Tailwind
            ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
            // Prettier owns formatting, so long class lists stay on one line
            'better-tailwindcss/enforce-consistent-line-wrapping': 'off',

            // Custom: import shared code through the package, not by reaching into its folder
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['**/packages/shared/**'],
                            message:
                                'Import shared code via @smart-home/packages/* instead.',
                        },
                    ],
                },
            ],
        },
    },

    // TypeScript only overrides
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            'no-undef': 'off', // TypeScript already checks this, and the base rule misreports types
            'no-unused-vars': 'off', // replaced by the TypeScript-aware version below
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
]
