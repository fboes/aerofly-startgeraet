export class FooterWebComponent extends HTMLElement {
    constructor() {
        super();
        this.setAttribute("aria-role", "footer");
        this.innerHTML = `\
<span id="application-name">xxx</span> <span id="application-version">xxx</span> &middot;
<a href="https://github.com/fboes/aerofly-startgeraet">GitHub</a> &middot; &copy; 2026
        `;
    }

    async connectedCallback() {
        const applicationName = this.querySelector("#application-name");
        const applicationVersion = this.querySelector("#application-version");
        if (applicationName && applicationVersion) {
            applicationName.textContent =
                (await window.applicationService?.getApplicationName()) ?? "Aerofly Startgerät";
            applicationVersion.textContent =
                (await window.applicationService?.getApplicationVersion()) ?? "unknown version";
        }
    }

    static registerElement() {
        customElements.define("startgeraet-footer", FooterWebComponent);
    }
}
