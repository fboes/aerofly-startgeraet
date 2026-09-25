import { registerElement } from "../../renderer/registerElement.js";
import { FlightBriefingWebComponent } from "../form/FlightBriefingWebComponent.js";

export class AsideWebComponent extends HTMLElement {
    private isInitialized = false;

    private elements!: {
        opener: HTMLSpanElement;
    };

    private initialize() {
        FlightBriefingWebComponent.registerElement();

        this.setAttribute("aria-role", "complementary");
        this.innerHTML = `\
<button class="opener" title="Open / close sidebar">‹</button>

<div class="content">
    <startgeraet-flight-briefing></startgeraet-flight-briefing>

    <p>Fuel, payload, runway waypoints, and the starting position cannot be set in this application and must be set in the simulator.</p>
</div>
        `;

        this.elements = {
            opener: this.querySelector(".opener") as HTMLButtonElement,
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.elements.opener.addEventListener("click", this.handleOpener);
    }

    disconnectedCallback(): void {
        this.elements.opener.removeEventListener("click", this.handleOpener);
    }

    private handleOpener = () => {
        this.classList.toggle("is-open");
        this.elements.opener.textContent = this.classList.contains("is-open") ? "›" : "‹";
    };

    static registerElement() {
        registerElement("startgeraet-aside", AsideWebComponent);
    }
}
