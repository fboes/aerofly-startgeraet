export class FuelPayloadWebComponent extends HTMLElement {
    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>⛽ Fuel / payload</h3>
<div class="d-flex">
    <div>
        <label for="fuelloadsetting-fuelmass">Fuel</label>
        <span class="d-flex">
            <input id="fuelloadsetting-fuelmass" type="number" value="50" min="0" />
            <span>kg</span></span>
        </div>
        <div>
            <label for="fuelloadsetting-payloadmass">Payload</label>
            <span class="d-flex">
                <input id="fuelloadsetting-payloadmass" type="number" value="80" min="0" />
                <span>kg</span>
            </span>
        </div>
    </div>
</div>
        `;
    }
    static registerElement() {
        customElements.define("startgeraet-fuel-payload", FuelPayloadWebComponent);
    }
}
