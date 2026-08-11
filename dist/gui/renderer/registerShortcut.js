const registry = new Map();
window.addEventListener("keydown", (e) => {
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
export function registerShortcut(key, handler) {
    if (registry.has(key)) {
        throw new Error(`Shortcut for key "${key}" is already registered.`);
    }
    registry.set(key, handler);
    return () => registry.delete(key);
}
export function shortcutString(key) {
    const modifier = window.process.platform === "darwin" ? "⌘" : "Ctrl";
    return `${modifier}+${key.toUpperCase()}`;
}
