export class FuelPayloadWebComponent extends HTMLElement {
    elements: {
        fuelMass: HTMLInputElement;
        payloadMass: HTMLInputElement;
    };

    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>⛽ Fuel / payload</h3>
<div class="d-flex">
    <div>
        <label for="fuelloadsetting-fuelmass">Fuel</label>
        <span class="d-flex">
            <input id="fuelloadsetting-fuelmass" type="number" value="0" min="0" />
            <span>kg</span></span>
        </div>
        <div>
            <label for="fuelloadsetting-payloadmass">Payload</label>
            <span class="d-flex">
                <input id="fuelloadsetting-payloadmass" type="number" value="0" min="0" />
                <span>kg</span>
            </span>
        </div>
    </div>
</div>
        `;
        this.elements = {
            fuelMass: document.getElementById("fuelloadsetting-fuelmass") as HTMLInputElement,
            payloadMass: document.getElementById("fuelloadsetting-payloadmass") as HTMLInputElement,
        };
    }

    connectedCallback() {
        window.aeroflyFlightService.onSendFlightplan((flightplan) => {
            this.elements.fuelMass.valueAsNumber = flightplan.aeroflyFlight.fuelLoadSetting.fuelMass;
            this.elements.payloadMass.valueAsNumber = flightplan.aeroflyFlight.fuelLoadSetting.payloadMass;
        });
    }

    static registerElement() {
        customElements.define("startgeraet-fuel-payload", FuelPayloadWebComponent);
    }
}
