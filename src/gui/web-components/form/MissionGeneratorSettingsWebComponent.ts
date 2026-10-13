import type { MissionGeneratorManifest } from "../../../mission-generator/MissionGenerator.type.js";
import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import { registerElement } from "../../renderer/registerElement.js";
import { sendToMain } from "../../renderer/sendToMain.js";

export class MissionGeneratorSettingsWebComponent extends HTMLElement {
    private isInitialized = false;

    private manifest: MissionGeneratorManifest | undefined = undefined;

    private elements!: {
        dialog: HTMLDialogElement;
        title: HTMLHeadingElement;
        description: HTMLParagraphElement;
        submitButton: HTMLButtonElement;
    };

    private initialize() {
        this.innerHTML = `\
<dialog id="dialog-mission-generator-settings">
  <h3>Mission Generator Settings</h3>

  <p>There are no settings available for the mission generator.</p>

  <button id="dialog-mission-generator-settings-generate">Generate</button>

  <button commandfor="dialog-mission-generator-settings" command="close" title="Close">✕</button>
</dialog>
        `;

        this.elements = {
            dialog: this.querySelector("dialog") as HTMLDialogElement,
            title: this.querySelector("h3") as HTMLHeadingElement,
            description: this.querySelector("p") as HTMLParagraphElement,
            submitButton: this.querySelector("button#dialog-mission-generator-settings-generate") as HTMLButtonElement,
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.elements.submitButton.addEventListener("click", this.handleClick);
    }

    open(manifest: MissionGeneratorManifest) {
        this.manifest = manifest;
        this.elements.title.innerText = manifest.displayName;
        this.elements.description.innerText = manifest.longDescription || manifest.description;
        this.elements.dialog.showModal();
    }

    handleClick = async () => {
        if (!this.manifest?.name) {
            return;
        }

        this.elements.dialog.close();

        dispatchNotificationEvent(document.body, `Generating mission`, "waiting");

        const response = await sendToMain<NotificationEventPayload<undefined>>("mission-generator:execute", {
            generatorName: this.manifest.name,
            generatorPayload: {},
        });
        dispatchNotificationEvent(document.body, response.message, response.type);
    };

    static registerElement() {
        registerElement("aerofly-mission-generator-settings", MissionGeneratorSettingsWebComponent);
    }
}
