export class MetarImport extends HTMLElement {
    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>⛅ METAR import</h3>
<div class="d-flex">
    <button id="import-weather">Import weather for <span id="">KEYW</span></button>
    <button id="import-weather-2">Import weather for <span id="">KMIA</span></button>
</div>
        `;
    }
    static registerElement() {
        customElements.define("startgeraet-metar-import", MetarImport);
    }
}
