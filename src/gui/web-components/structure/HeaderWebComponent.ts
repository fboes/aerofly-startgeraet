import type { ApplicationJSON } from "../../../core/services/getApplicationInformation.js";
import type { GithubReleaseApiPayload } from "../../../core/services/UpdateCheckService.js";
import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import { SettingsWebComponent } from "../form/SettingsWebComponent.js";
import { registerElement } from "../util/registerElement.js";

export class HeaderWebComponent extends HTMLElement {
    private isInitialized = false;

    private elements!: {
        title: HTMLHeadingElement;
        version: HTMLAnchorElement;
    };

    private initialize() {
        SettingsWebComponent.registerElement();

        this.setAttribute("aria-role", "header");
        this.innerHTML = `\
<h1>
    <img src="../../assets/icons/icon.svg" alt="App Icon" width="24" height="24">
    <span>Aerofly Startgerät</span>
    <a href="https://github.com/" target="update" class="version" title="Check for updates">0.0.0</a>
</h1>
<startgeraet-settings></startgeraet-settings>
        `;

        this.elements = {
            title: this.querySelector("h1 span") as HTMLHeadingElement,
            version: this.querySelector("h1 .version") as HTMLAnchorElement,
        };
    }

    async connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
            setTimeout(() => this.getUpdateInformation(), 2_000);
        }

        const appInfo = await sendToMain<ApplicationJSON>("application:get-information");

        this.elements.title.textContent = appInfo.name;
        this.elements.version.textContent = appInfo.version;
        this.elements.version.href = appInfo.github.releaseUrl;
    }

    async getUpdateInformation() {
        const response =
            await sendToMain<NotificationEventPayload<GithubReleaseApiPayload | null>>("update:get-information");

        if (response.payload) {
            dispatchNotificationEvent(document.body, response.message, response.type);
            this.elements.version.title = response.message;
            this.elements.version.classList.add("has-update-available");
        }
    }

    static registerElement() {
        registerElement("startgeraet-header", HeaderWebComponent);
    }
}
