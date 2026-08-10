/**
 * Register custom web component, preventing duplicate definitions.
 */
export function registerElement(
    name: string,
    constructor: CustomElementConstructor,
    options?: ElementDefinitionOptions,
) {
    if (!customElements.get(name)) {
        customElements.define(name, constructor, options);
    }
}
