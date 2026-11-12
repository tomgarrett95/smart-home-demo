import js from '@eslint/js'
import eslintReact from '@eslint-react/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import regex from 'eslint-plugin-regex'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import globals from 'globals'

export default [
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**',
      '.idea/**',
      'scripts/**/*.*',
      '!scripts/**/*.js',
      '!scripts/**/*.mjs',
      'db/**',
      'dump.rdb',
      '.husky/**',
      'Config/**',
      'Config.production/**',
      'Documentation/**',
      '.env',
      '.env.production',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'lerna-debug.log',
      '*.md',
      '*.sh',
      '.eslintcache',
      '.eslintrc.json',
      'junit.xml',
      'jest.config.js',
      'reports/**',
      'packagehash.txt',
      'tsconfig.json',
      'git-crypt-key',
      'lerna.json',
    ],
  },

  {
    ...js.configs.recommended,
  },

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
        ...globals.node,
      },
    },
    plugins: {
      eslintReact,
      'react-hooks': reactHooks,
      '@typescript-eslint': typescript,
      prettier,
      regex,
      'better-tailwindcss': eslintPluginBetterTailwindcss,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'better-tailwindcss': {
        entryPoint: 'client-src/index.css',
      },
    },
    rules: {
      // JS
      indent: ['off', 4],
      'linebreak-style': ['off', 'unix'],
      quotes: ['off', 'single'],
      semi: ['off', 'never'],
      'prefer-arrow-callback': 'warn',
      'eol-last': 'warn',

      // TS
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Prettier
      'prettier/prettier': 'off',

      // Regex
      'regex/invalid': [
        'warn',
        [
          {
            regex: 'console\\.log',
            files: { inspect: 'client-src' },
            message: 'Leftover `console.log`.',
          },
          {
            regex: 'TODO',
            files: { inspect: 'client-src' },
            message: 'Leftover `TODO`.',
          },
        ],
      ],

      // React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-key': [
        'warn',
        { checkFragmentShorthand: true, warnOnDuplicates: true },
      ],
      'react/jsx-wrap-multilines': 'warn',
      'react/jsx-max-props-per-line': ['warn', { maximum: 1, when: 'multiline' }],
      'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],

      ...reactHooks.configs.recommended.rules,

      ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,

      'better-tailwindcss/no-unregistered-classes': [
        'error',
        {
          ignore: [
            '^ag-', // ignore all AG Grid classes
          ],
        },
      ],

      // Custom
      'no-restricted-imports': [
        'error',
        { patterns: ['**/packages/**', '../**/src/**'] },
      ],

      // Jest (if used)
      'jest/no-conditional-expect': 'off',
    },
  },

  // TypeScript only overrides
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off', // Disable base rule for TypeScript files
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // React only overrides
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },

  // Test files
  {
    files: ['**/*.test.{js,ts,jsx,tsx}'],
    rules: {
      'no-script-url': 'off',
    },
  },
]
