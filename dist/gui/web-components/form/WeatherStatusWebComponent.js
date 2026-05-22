export class WeatherStatusWebComponent extends HTMLElement {
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
            flightCategoryUs: document.getElementById("flight-category-us"),
            flightCategoryIcao: document.getElementById("flight-category-icao"),
        };
    }
    connectedCallback() {
        window.electronAPI.onStateUpdate((state) => {
            this.elements.flightCategoryUs.textContent = state.flightCategory.us;
            this.elements.flightCategoryIcao.textContent = state.flightCategory.icao;
        });
    }
    static registerElement() {
        customElements.define("startgeraet-weather-status", WeatherStatusWebComponent);
    }
}
