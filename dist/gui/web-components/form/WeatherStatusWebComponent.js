import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export class WeatherStatusWebComponent extends AbstractStateSubscriberWebComponent {
    elements;
    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>⛅ Weather status</h3>
<div class="d-flex">
    <div class="form-group">
        <label for="flight-category-us">Flight category (US)</label>
        <output id="flight-category-us">Unknown</output>
    </div>
        <div class="form-group">
        <label for="flight-category-icao">Flight category (ICAO)</label>
        <output id="flight-category-icao">Unknown</output>
    </div>
</div>
`;
        this.elements = {
            flightCategoryUs: this.querySelector("#flight-category-us"),
            flightCategoryIcao: this.querySelector("#flight-category-icao"),
        };
    }
    connectedCallback() {
        this.subscribeToStateUpdates((state) => {
            this.elements.flightCategoryUs.textContent = state.flightCategory.us;
            this.elements.flightCategoryIcao.textContent = state.flightCategory.icao;
        });
    }
    static registerElement() {
        customElements.define("startgeraet-weather-status", WeatherStatusWebComponent);
    }
}
