import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";

export type MetarInputWebComponentState = {
    metar: string;
};

export class MetarInputWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        metar: HTMLTextAreaElement;
    };

    get state(): MetarInputWebComponentState {
        return {
            metar: this.elements.metar.value,
        };
    }

    intialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>METAR</h3>
<div class="form-group">
    <label for="metar-input">METAR string</label>
    <textarea id="metar-input" rows="4" placeholder="Enter METAR string here..."></textarea>
</div>
        `;

        this.elements = {
            metar: this.querySelector("#metar-input") as HTMLTextAreaElement,
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.intialize();
            this.isInitialized = true;
        }
        this.elements.metar.addEventListener("input", this.handleChange);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.elements.metar.removeEventListener("input", this.handleChange);
    }

    handleChange: () => void = () => {
        sendToMain("metar:set", this.state);
    };

    static registerElement() {
        customElements.define("startgeraet-metar-input", MetarInputWebComponent);
    }
}
