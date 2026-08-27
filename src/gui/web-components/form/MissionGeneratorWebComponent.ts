import { sendToMain } from "../../renderer/sendToMain.js";
import { registerElement } from "../../renderer/registerElement.js";
import { registerShortcut, shortcutString } from "../../renderer/registerShortcut.js";
import type { MissionGeneratorManifest } from "../../../core/converter/generator/GeneratorInterface.js";

export class MissionGeneratorWebComponent extends HTMLElement {
    private isInitialized = false;
    private shortcut: (() => void) | undefined = undefined;
    private readonly shortcutKey = "g";

    private missionGeneratorManifests: MissionGeneratorManifest[] = [];

    private elements!: {
        button: HTMLButtonElement;
        dialog: HTMLDialogElement;
        dialogInner: HTMLElement;
    };

    private initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\

<button commandfor="dialog-mission-generator" command="show-modal" title="${shortcutString(this.shortcutKey)}">Mission <u>g</u>enerator</button>

<dialog id="dialog-mission-generator" closedby="any">
  <h3>Mission generator</h3>

  <section class="d-flex">No mission generator found</section>

  <button commandfor="dialog-simbrief" command="close" title="Close">✕</button>
</dialog>
        `;

        this.elements = {
            button: this.querySelector("button") as HTMLButtonElement,
            dialog: this.querySelector("dialog") as HTMLDialogElement,
            dialogInner: this.querySelector("dialog section") as HTMLElement,
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

        console.warn(`TODO: Open actual mission generator configuration dialog for "${e.target.dataset.name}"`); // TODO
    };

    private createDialog() {
        if (this.missionGeneratorManifests.length === 0) {
            this.elements.dialogInner.innerHTML = "No mission generators found";
            return;
        }

        const tableCells = this.missionGeneratorManifests.map(
            (m) => `\
<tr>
  <td><button data-name="${m.name}">${m.displayName}</button></td>
  <td>${m.description}</td>
</tr>
`,
        );

        this.elements.dialogInner.innerHTML = `\
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
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
