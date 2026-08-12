const registry = new Map();
const CLASS_BODY_ACTIVE = "has-pressed-modifier";
window.addEventListener("keydown", (e) => {
    const modifier = window.process.platform === "darwin" ? e.metaKey : e.ctrlKey;
    if (!modifier) {
        return;
    }
    document.body?.classList.add(CLASS_BODY_ACTIVE);
    window.addEventListener("keyup", () => {
        document.body?.classList.remove(CLASS_BODY_ACTIVE);
    }, { once: true });
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
