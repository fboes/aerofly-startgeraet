export class WindWebComponent extends HTMLElement {
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
    <div>
        <label for="wind-speed">Wind speed</label>
        <span class="d-flex">
            <input id="wind-speed" type="number" min="0" value="5" />
            <span>kts</span>
        </span>
    </div>
    <div>
        <label for="wind-gust">Wind gusts</label>
        <span class="d-flex">
            <input id="wind-gust" type="number" min="0" value="0" />
            <span>kts</span>
        </span>
    </div>
    <div>
        <label for="wind-direction">Wind direction</label>
        <span class="d-flex">
            <input id="wind-direction" type="number" min="-1" max="360" value="241" />
            <span>°</span>
        </span>
    </div>
</div>
        `;

        this.elements = {
            windSpeed: document.getElementById("wind-speed") as HTMLInputElement,
            windGust: document.getElementById("wind-gust") as HTMLInputElement,
            windDirection: document.getElementById("wind-direction") as HTMLInputElement,
        };
    }

    connectedCallback() {
        this.elements.windDirection.addEventListener("input", () => {
            this.elements.windDirection.valueAsNumber = (this.elements.windDirection.valueAsNumber + 360) % 360;
        });

        window.electronAPI.onStateUpdate((state) => {
            this.elements.windSpeed.valueAsNumber = state.aeroflyFlight.wind.speed_kts;
            this.elements.windGust.valueAsNumber = state.aeroflyFlight.wind.gust_kts;
            this.elements.windDirection.valueAsNumber = state.aeroflyFlight.wind.directionInDegree;
        });
    }

    static registerElement() {
        customElements.define("startgeraet-wind", WindWebComponent);
    }
}
