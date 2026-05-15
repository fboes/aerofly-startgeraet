export class WindWebComponent extends HTMLElement {
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
    }

    connectedCallback() {
        const windDirection = document.getElementById("wind-direction");
        if (windDirection instanceof HTMLInputElement) {
            windDirection.addEventListener("input", () => {
                windDirection.valueAsNumber = (windDirection.valueAsNumber + 360) % 360;
            });
        }
    }

    static registerElement() {
        customElements.define("startgeraet-wind", WindWebComponent);
    }
}
