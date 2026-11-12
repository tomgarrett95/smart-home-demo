export default {
    '*': 'prettier --write --ignore-unknown',
    'apps/client/**/*.{ts,tsx}': 'eslint --fix --max-warnings=0',
}
