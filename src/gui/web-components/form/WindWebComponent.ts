import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";

export type WindWebComponentState = {
    speed_kts: number;
    gust_kts: number;
    directionInDegree: number;
};

export class WindWebComponent extends AbstractStateSubscriberWebComponent {
    elements: {
        windSpeed: HTMLInputElement;
        windGust: HTMLInputElement;
        windDirection: HTMLInputElement;
    };

    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>🧭 Wind</h3>
<div class="d-flex">
    <div class="form-group">
        <label for="wind-speed">Wind speed</label>
        <span class="d-flex">
            <input id="wind-speed" type="number" min="0" value="5" />
            <span>kts</span>
        </span>
    </div>
    <div class="form-group">
        <label for="wind-gust">Wind gusts</label>
        <span class="d-flex">
            <input id="wind-gust" type="number" min="0" value="0" />
            <span>kts</span>
        </span>
    </div>
    <div class="form-group">
        <label for="wind-direction">Wind direction</label>
        <span class="d-flex">
            <input id="wind-direction" type="number" min="-1" max="360" value="241" />
            <span>°</span>
        </span>
    </div>
</div>
        `;

        this.elements = {
            windSpeed: this.querySelector("#wind-speed") as HTMLInputElement,
            windGust: this.querySelector("#wind-gust") as HTMLInputElement,
            windDirection: this.querySelector("#wind-direction") as HTMLInputElement,
        };
    }

    get state(): WindWebComponentState {
        return {
            speed_kts: this.elements.windSpeed.valueAsNumber,
            gust_kts: this.elements.windGust.valueAsNumber,
            directionInDegree: this.elements.windDirection.valueAsNumber,
        };
    }

    connectedCallback() {
        this.subscribeToStateUpdates((state) => {
            this.elements.windSpeed.valueAsNumber = Math.round(state.aeroflyFlight.wind.speed_kts);
            this.elements.windGust.valueAsNumber = Math.round(state.aeroflyFlight.wind.gust_kts);
            this.elements.windDirection.valueAsNumber = Math.round(state.aeroflyFlight.wind.directionInDegree);
        });

        this.addEventListener("input", this.handleChange);
    }

    handleChange() {
        this.elements.windDirection.valueAsNumber = (this.elements.windDirection.valueAsNumber + 360) % 360;
        sendToMain("wind:set", this.state);
    }

    static registerElement() {
        customElements.define("startgeraet-wind", WindWebComponent);
    }
}
