const registry = new Map();

window.addEventListener("keydown", (e: KeyboardEvent) => {
    const modifier = window.process.platform === "darwin" ? e.metaKey : e.ctrlKey;
    if (!modifier) {
        return;
    }

    const handler = registry.get(e.key);
    if (!handler) {
        return;
    }

    e.preventDefault();
    handler();
});

/**
 *
 * @param key single character to trigger handler. E.g. `S` will be triggered via `CTRL+S` / `OPT+S`.
 * @param handler
 * @returns additional handler for unregistering
 */
export function registerShortcut(key: string, handler: () => void): () => boolean {
    registry.set(key, handler);
    return () => registry.delete(key);
}
