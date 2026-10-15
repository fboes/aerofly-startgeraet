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
        form: HTMLDivElement;
        inputElements: HTMLInputElement[];
        submitButton: HTMLButtonElement;
    };

    get state(): Record<string, string | number | undefined> {
        const state: Record<string, string | number | undefined> = {};
        for (const input of this.elements.inputElements) {
            state[input.name] = !input.value ? undefined : input.type === "number" ? input.valueAsNumber : input.value;
        }

        return state;
    }

    private initialize() {
        this.innerHTML = `\
<dialog id="dialog-mission-generator-settings">
  <h3>Mission Generator Settings</h3>

  <p>There are no settings available for the mission generator.</p>

  <div id="dialog-mission-generator-settings-form" class="d-flex"></div>

  <button id="dialog-mission-generator-settings-generate">Generate</button>

  <button commandfor="dialog-mission-generator-settings" command="close" title="Close">✕</button>
</dialog>
        `;

        this.elements = {
            dialog: this.querySelector("dialog") as HTMLDialogElement,
            title: this.querySelector("h3") as HTMLHeadingElement,
            description: this.querySelector("p") as HTMLParagraphElement,
            form: this.querySelector("#dialog-mission-generator-settings-form") as HTMLDivElement,
            inputElements: [],
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

    disconnectedCallback() {
        this.elements.submitButton.removeEventListener("click", this.handleClick);
    }

    open(manifest: MissionGeneratorManifest) {
        this.manifest = manifest;
        this.elements.title.innerText = manifest.displayName;
        this.elements.description.innerText = manifest.longDescription || manifest.description;
        this.elements.form.replaceChildren(...this.getFormFieldsHtml());
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
            generatorPayload: this.state,
        });
        dispatchNotificationEvent(document.body, response.message, response.type);
    };

    /**
     * <div class="form-group">
        <label for="wind-gust">Wind gusts</label>
        <span class="input-group">
            <input id="wind-gust" type="number" min="0" value="0" />
            <span>kts</span>
        </span>
    </div>
     */
    private getFormFieldsHtml(): HTMLElement[] {
        if (!this.manifest?.configuration) {
            return [];
        }

        this.elements.inputElements = [];

        return this.manifest.configuration.map((c) => {
            const div = document.createElement("div");
            div.classList.add("form-group");

            const label = document.createElement("label");
            label.innerText = c.label;

            const input = document.createElement("input");
            input.name = c.name;
            input.type = c.type;
            if (c.min) {
                input.min = c.min.toString();
            }
            if (c.max) {
                input.max = c.max.toString();
            }
            if (c.step) {
                input.step = c.step.toString();
            }
            if (c.pattern) {
                input.pattern = c.pattern;
            }
            if (c.default) {
                input.value = c.default.toString();
            }
            input.required = c.required;
            this.elements.inputElements.push(input);

            if (c.unit) {
                const unitSpan = document.createElement("span");
                unitSpan.innerText = c.unit;

                const inputGroupSpan = document.createElement("span");
                inputGroupSpan.classList.add("input-group");
                inputGroupSpan.append(input, unitSpan);

                div.append(label, inputGroupSpan);
            } else {
                div.append(label, input);
            }

            return div;
        });
    }

    static registerElement() {
        registerElement("aerofly-mission-generator-settings", MissionGeneratorSettingsWebComponent);
    }
}
