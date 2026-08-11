import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import { FlightPlanChooserWebComponent } from "./FlightPlanChooserWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
import { registerShortcut } from "../../renderer/registerShortcut.js";

export type ImportWebComponentPayload = {
    flightplans: string[];
    filepath: string;
};

export class ImportWebComponent extends HTMLElement {
    private isInitialized = false;
    private shortcut: (() => void) | undefined = undefined;

    private elements!: {
        button: HTMLButtonElement;
        fpChooser: FlightPlanChooserWebComponent;
    };

    private initialize() {
        FlightPlanChooserWebComponent.registerElement();

        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button title="CTRL+O / OPT+O"><u>O</u>pen / Import flight plan</button>
<aerofly-flightplan-chooser></aerofly-flightplan-chooser>
        `;

        this.elements = {
            button: this.querySelector("button") as HTMLButtonElement,
            fpChooser: this.querySelector("aerofly-flightplan-chooser") as FlightPlanChooserWebComponent,
        };

        this.elements.fpChooser.style.position = "absolute";
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.elements.button.addEventListener("click", this.handleClick);
        this.shortcut = registerShortcut("o", this.handleClick);
    }

    disconnectedCallback() {
        this.elements.button.removeEventListener("click", this.handleClick);
        if (this.shortcut) {
            this.shortcut();
        }
    }

    handleClick = async () => {
        const response =
            await sendToMain<NotificationEventPayload<ImportWebComponentPayload | undefined>>("flightplan:import-file");
        dispatchNotificationEvent<ImportWebComponentPayload | undefined>(
            document.body,
            response.message,
            response.type,
            response.payload,
        );

        if (response.type === "success") {
            dispatchNotificationEvent<undefined>(
                document.body,
                "Please remember to set the initial starting position of your aircraft in the simulator.",
                "info",
            );
        }

        if (response.payload) {
            console.log(this.elements.fpChooser);
            this.elements.fpChooser.values = response.payload;
            this.elements.fpChooser.open();
        }
    };

    static registerElement() {
        registerElement("startgeraet-import", ImportWebComponent);
    }
}
