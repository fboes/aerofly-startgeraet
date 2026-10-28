import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

const webComponents = ["{src,dist}/gui/web-components/**", "{src,dist}/gui/renderer/**", "docs/simform"];

export default defineConfig([
    {
        files: ["**/*.{js,ts}"],
        plugins: { js },
        extends: ["js/recommended"],
    },
    tseslint.configs.strict,
    {
        files: ["**/*.ts}"],
        rules: {
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-misused-promises": "error",
        },
    },
    {
        // Electron main / Node-Code
        files: ["**/*.{js,ts}"],
        ignores: webComponents,
        languageOptions: { globals: { ...globals.nodeBuiltin } },
    },
    {
        // Renderer / Web Components
        files: webComponents.map((p) => `${p}/*.{js,ts}`),
        languageOptions: { globals: { ...globals.browser } },
    },
]);
