module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        node: true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
        "no-useless-escape": 0,
        "quotes": 0,
        "no-debugger": 0,
        "@typescript-eslint/no-empty-interface":0,
        "@typescript-eslint/no-explicit-any":0,
        "@typescript-eslint/no-var-requires":0,
        "@typescript-eslint/ban-ts-comment":0,
    }
}
