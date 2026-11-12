import { readFileSync } from 'node:fs'
import { parse } from 'dotenv'
import { defineConfig } from 'vitest/config'

// Loaded here and passed in explicitly, so tests can never fall back to the dev database in .env
// (dotenv/config in src/env.ts doesn't override variables that are already set)
const testEnv = parse(readFileSync(new URL('./.env.test', import.meta.url)))

export default defineConfig({
    test: {
        environment: 'node',
        include: ['test/**/*.test.ts'],
        env: testEnv,
        globalSetup: ['./test/globalSetup.ts'],
        setupFiles: ['./test/setup.ts'],
        // All test files share one database, so run them one at a time to avoid
        // one file truncating tables while another is mid-test
        fileParallelism: false,
    },
})
