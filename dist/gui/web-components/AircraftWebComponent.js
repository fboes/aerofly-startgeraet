export class AircraftWebComponent extends HTMLElement {
    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>✈️ Aircraft</h3>

<div class="d-flex">
    <div>
        <label for="aircraft-name">Aircraft</label>
        <select id="aircraft-name">
            <option>Cessna 172</option>
        </select>
    </div>
    <div>
        <label for="aircraft-paintscheme">Livery</label>
        <select id="aircraft-paintscheme">
            <option>default</option>
        </select>
    </div>
</div>
        `;
    }
    static registerElement() {
        customElements.define("startgeraet-aircraft", AircraftWebComponent);
    }
}
