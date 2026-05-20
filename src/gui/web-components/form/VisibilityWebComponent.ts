import { sendToMain } from "../../renderer/sendToMain.js";

export type VisibilityWebComponentState = {
    visibilityMeters: number;
};

export class VisibilityWebComponent extends HTMLElement {
    elements: {
        visibilitySm: HTMLInputElement;
        visibilityMeters: HTMLInputElement;
    };

    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>🌁 Visibility</h3>
<div class="d-flex">
    <div>
        <label for="visibility-sm">Visibility SM</label>
        <span class="d-flex">
            <input id="visibility-sm" type="number" min="0" step="0.25" value="10" />
            <span>SM</span>
        </span>
    </div>
    <div>
        <label for="visibility-meters">Visibility m</label>
        <span class="d-flex">
            <input id="visibility-meters" type="number" min="0" step="100" value="9999" />
            <span>m</span>
        </span>
    </div>
</div>
        `;
        this.elements = {
            visibilitySm: document.getElementById("visibility-sm") as HTMLInputElement,
            visibilityMeters: document.getElementById("visibility-meters") as HTMLInputElement,
        };
    }

    get state(): VisibilityWebComponentState {
        return {
            visibilityMeters: this.elements.visibilityMeters.valueAsNumber,
        };
    }

    connectedCallback() {
        this.elements.visibilitySm.addEventListener("input", () => {
            this.setMetersFromSm();
        });

        this.elements.visibilityMeters.addEventListener("input", () => {
            this.setSmFromMeters();
        });

        this.setSmFromMeters();

        window.electronAPI.onStateUpdate((state) => {
            this.elements.visibilityMeters.valueAsNumber = Math.round(state.aeroflyFlight.visibility_meter);
            this.setSmFromMeters();
        });

        this.addEventListener("input", () => this.handleChange());
    }

    handleChange() {
        sendToMain<VisibilityWebComponentState>("visibility:set", this.state);
    }

    protected setMetersFromSm() {
        this.elements.visibilityMeters.valueAsNumber =
            Math.round((this.elements.visibilitySm.valueAsNumber * 1609.344) / 100) * 100;
    }

    protected setSmFromMeters() {
        this.elements.visibilitySm.valueAsNumber =
            this.elements.visibilityMeters.valueAsNumber === 9999
                ? 10
                : Math.round(this.elements.visibilityMeters.valueAsNumber / 1609.344 / 0.25) * 0.25;
    }

    static registerElement() {
        customElements.define("startgeraet-visibility", VisibilityWebComponent);
    }
}
