import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
export class WindWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    elements;
    initialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<div class="d-flex">
    <div class="form-group">
        <label for="wind-speed" class="header"><startgeraet-icon icon="wind"></startgeraet-icon>&nbsp;Wind</label>
        <span class="input-group">
            <input id="wind-speed" type="number" min="0" value="5" />
            <span>kts</span>
        </span>
    </div>
    <div class="form-group">
        <label for="wind-gust">Wind gusts</label>
        <span class="input-group">
            <input id="wind-gust" type="number" min="0" value="0" />
            <span>kts</span>
        </span>
    </div>
    <div class="form-group">
        <label for="wind-direction">Wind direction</label>
        <span class="input-group">
            <input id="wind-direction" type="number" min="-1" max="360" value="241" />
            <span>°</span>
        </span>
    </div>
</div>
        `;
        this.elements = {
            windSpeed: this.querySelector("#wind-speed"),
            windGust: this.querySelector("#wind-gust"),
            windDirection: this.querySelector("#wind-direction"),
        };
    }
    get state() {
        return {
            speed_kts: this.elements.windSpeed.valueAsNumber || 0,
            gust_kts: this.elements.windGust.valueAsNumber || 0,
            directionInDegree: this.elements.windDirection.valueAsNumber || 0,
        };
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.subscribeToStateUpdates((state) => {
            this.elements.windSpeed.valueAsNumber = Math.round(state.aeroflyFlight.wind.speed_kts);
            this.elements.windGust.valueAsNumber = Math.round(state.aeroflyFlight.wind.gust_kts);
            this.elements.windDirection.valueAsNumber = Math.round(state.aeroflyFlight.wind.directionInDegree);
            this.elements.windGust.classList.toggle("input-warning", state.aeroflyFlight.wind.gust_kts !== 0 &&
                state.aeroflyFlight.wind.gust_kts <= state.aeroflyFlight.wind.speed_kts);
        });
        this.addEventListener("input", this.handleChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener("input", this.handleChange);
    }
    handleChange = () => {
        this.elements.windDirection.valueAsNumber = (this.elements.windDirection.valueAsNumber + 360) % 360;
        sendToMain("wind:set", this.state);
    };
    static registerElement() {
        registerElement("startgeraet-wind", WindWebComponent);
    }
}
