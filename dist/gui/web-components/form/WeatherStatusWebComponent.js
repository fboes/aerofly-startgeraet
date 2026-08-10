import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../util/registerElement.js";
export class WeatherStatusWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    elements;
    initialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<div class="d-flex">
    <div class="form-group">
        <label for="flight-category-icao" class="header"><startgeraet-icon icon="cloud-sun"></startgeraet-icon>&nbsp;Flight category</label>
        <select id="flight-category-icao">
            <option value="VFR">VFR</option>
            <option value="IFR">IFR</option>
        </select>
    </div>
    <div class="form-group">
        <label for="flight-category-us">Flight category (US)</label>
        <select id="flight-category-us">
            <option value="VFR">VFR</option>
            <option value="MVFR">MVFR</option>
            <option value="IFR">IFR</option>
            <option value="LIFR">LIFR</option>
        </select>
    </div>
</div>
`;
        this.elements = {
            flightCategoryUs: this.querySelector("#flight-category-us"),
            flightCategoryIcao: this.querySelector("#flight-category-icao"),
        };
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.subscribeToStateUpdates((state) => {
            this.elements.flightCategoryUs.value = state.flightCategory.us;
            this.elements.flightCategoryIcao.value = state.flightCategory.icao;
        });
        this.elements.flightCategoryUs.addEventListener("change", this.handleFlightCategoryUsChange);
        this.elements.flightCategoryIcao.addEventListener("change", this.handleFlightCategoryIcaoChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.elements.flightCategoryUs.removeEventListener("change", this.handleFlightCategoryUsChange);
        this.elements.flightCategoryIcao.removeEventListener("change", this.handleFlightCategoryIcaoChange);
    }
    handleFlightCategoryUsChange = () => {
        sendToMain("flight-category:us:set", this.elements.flightCategoryUs.value);
    };
    handleFlightCategoryIcaoChange = () => {
        sendToMain("flight-category:icao:set", this.elements.flightCategoryIcao.value);
    };
    static registerElement() {
        registerElement("startgeraet-weather-status", WeatherStatusWebComponent);
    }
}
