/**
 *
 * @param key single character to trigger handler. E.g. `S` will be triggered via `CTRL+S` / `OPT+S`.
 * @param handler
 * @returns additional handler for unregistering
 */
export declare function registerShortcut(key: string, handler: () => void): () => boolean;
export declare function shortcutString(key: string): string;
//# sourceMappingURL=registerShortcut.d.ts.map