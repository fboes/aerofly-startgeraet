import type { JsonSchemaType } from "../../../mission-generator/JsonSchema.type.js";
import type {
    MissionGeneratorManifest,
    MissionGeneratorManifestField,
} from "../../../mission-generator/MissionGenerator.type.js";
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
        inputElements: (HTMLInputElement | HTMLSelectElement)[];
        submitButton: HTMLButtonElement;
    };

    get state(): Record<string, string | number | boolean | undefined> {
        const state: Record<string, string | number | boolean | undefined> = {};
        for (const input of this.elements.inputElements) {
            state[input.name] = this.getInputValue(input);
        }

        return state;
    }

    private getInputValue(input: HTMLInputElement | HTMLSelectElement): string | number | boolean | undefined {
        if (input.value === "") {
            return undefined;
        }
        switch (input.type) {
            case "number":
                return input.valueAsNumber;
            case "checkbox":
                return input.checked;
            default:
                return input.value;
        }
    }

    private initialize() {
        this.innerHTML = `\
<dialog id="dialog-mission-generator-settings">
  <h3>Mission Generator Settings</h3>

  <p>There are no settings available for the mission generator.</p>

  <div id="dialog-mission-generator-settings-form" class="d-flex"></div>
  <button id="dialog-mission-generator-settings-generate" class="mt-3">Generate</button>

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
        this.elements.form.replaceChildren(...this.getFormFieldElements());
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

    private getFormFieldElements(): HTMLElement[] {
        if (!this.manifest?.configuration) {
            return [];
        }

        this.elements.inputElements = [];

        return this.manifest.configuration.map((c) => {
            const div = document.createElement("div");
            div.classList.add("form-group");

            const label = document.createElement("label");
            label.innerText = c.title || c.name;

            const input = this.getInput(c);
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

    private getInput(c: MissionGeneratorManifestField) {
        const input = document.createElement(c.enum ? "select" : "input");
        input.name = c.name;
        input.required = c.isRequired;

        if (input instanceof HTMLSelectElement && c.enum) {
            input.append(
                ...c.enum.map((e) => {
                    const opt = document.createElement("option");
                    opt.innerText = String(e);
                    return opt;
                }),
            );
        }

        if (input instanceof HTMLInputElement) {
            input.type = this.jsonSchemaTypeToInputType(c.type);
            if (c.multipleOf) {
                input.step = c.multipleOf.toString();
            }
            if (c.minimum) {
                input.min = c.minimum.toString();
            }
            if (c.maximum) {
                input.max = c.maximum.toString();
            }
            if (c.default !== undefined && c.default !== null) {
                input.value = c.default.toString();
            }
            if (c.pattern) {
                input.pattern = c.pattern;
            }
        }
        return input;
    }

    private jsonSchemaTypeToInputType(jsonSchemaType: JsonSchemaType): string {
        switch (jsonSchemaType) {
            case "number":
            case "integer":
                return "number";
            case "boolean":
                return "checkbox";
            default:
                return "text";
        }
    }

    static registerElement() {
        registerElement("aerofly-mission-generator-settings", MissionGeneratorSettingsWebComponent);
    }
}
