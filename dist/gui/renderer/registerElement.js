/**
 * Register custom web component, preventing duplicate definitions.
 */
export function registerElement(name, constructor, options) {
    if (!customElements.get(name)) {
        customElements.define(name, constructor, options);
    }
}
