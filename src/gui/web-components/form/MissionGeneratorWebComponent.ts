import { sendToMain } from "../../renderer/sendToMain.js";
import { registerElement } from "../../renderer/registerElement.js";
import { registerShortcut, htmlShortcutString } from "../../renderer/registerShortcut.js";
import type { MissionGeneratorManifest } from "../../../mission-generator/MissionGenerator.type.js";
import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import { html } from "../../../core/formatter/html.js";

export class MissionGeneratorWebComponent extends HTMLElement {
    private isInitialized = false;
    private shortcut: (() => void) | undefined = undefined;
    private readonly shortcutKey = "g";

    private missionGeneratorManifests: MissionGeneratorManifest[] = [];

    private elements!: {
        button: HTMLButtonElement;
        dialog: HTMLDialogElement;
        dialogInner: HTMLElement;
        // missionGeneratorSettings
    };

    private initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\

<button commandfor="dialog-mission-generator" command="show-modal" title="${htmlShortcutString(this.shortcutKey)}">Mission <u>g</u>enerator</button>

<dialog id="dialog-mission-generator" closedby="any">
  <h3>Mission generator</h3>
  <section class="d-flex">No mission generator found</section>
  <button commandfor="dialog-mission-generator" command="close" title="Close">✕</button>
</dialog>

<!-- aerofly-mission-generator-settings></aerofly-mission-generator-settings -->
        `;

        this.elements = {
            button: this.querySelector("button") as HTMLButtonElement,
            dialog: this.querySelector("dialog") as HTMLDialogElement,
            dialogInner: this.querySelector("dialog section") as HTMLElement,
            // missionGeneratorSettings: this.querySelector("aerofly-mission-generator-settings")
        };
    }

    async connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.missionGeneratorManifests = await sendToMain<MissionGeneratorManifest[]>(
            "mission-generator:get-manifests",
        );

        if (this.missionGeneratorManifests.length === 0) {
            this.elements.button.disabled = true;
            return;
        }

        this.createDialog();

        this.shortcut = registerShortcut(this.shortcutKey, () => {
            this.elements.dialog.showModal();
        });

        this.addEventListener("click", this.handleClick);
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.handleClick);
        if (this.shortcut) {
            this.shortcut();
        }
    }

    handleClick = async (e: PointerEvent) => {
        if (!(e.target instanceof HTMLButtonElement)) {
            return;
        }

        if (!e.target.dataset?.name) {
            return;
        }

        this.elements.dialog.close();

        /*
        const response = await sendToMain<NotificationEventPayload<MissionGeneratorManifest>("mission-generator:get-manifest", e.target.dataset.name,
        );
        if (response.payload) {
            this.elements.missionGeneratorSettings.schema = response.payload;
            this.elements.missionGeneratorSettings.open();
        } */

        dispatchNotificationEvent(document.body, `Generating mission`, "waiting");

        const response = await sendToMain<NotificationEventPayload<undefined>>("mission-generator:execute", {
            generatorName: e.target.dataset.name,
            generatorPayload: {},
        });
        dispatchNotificationEvent(document.body, response.message, response.type);
    };

    private createDialog() {
        if (this.missionGeneratorManifests.length === 0) {
            this.elements.dialogInner.innerText = "No mission generators found";
            return;
        }

        const tableCells = this.missionGeneratorManifests.map(
            (m) => `\
<tr>
  <td class="name"><button data-name="${html(m.name)}">${html(m.displayName)}</button></td>
  <td class="description">${html(m.description)}</td>
</tr>
`,
        );

        this.elements.dialogInner.innerHTML = `\
<table class="w-100">
  <thead>
    <tr>
      <th class="name">Name</th>
      <th class="description">Description</th>
    </tr>
  </thead>
  <tbody>
    ${tableCells.join("\n")}
  </tbody>
</table>`;
    }

    static registerElement() {
        registerElement("startgeraet-mission-generator", MissionGeneratorWebComponent);
    }
}
