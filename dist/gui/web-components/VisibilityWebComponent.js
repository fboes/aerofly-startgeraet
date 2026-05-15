export class VisibilityWebComponent extends HTMLElement {
    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>🌁 Visibility</h3>
<div class="d-flex">
    <div>
        <label for="visibility-sm">Visibility SM</label>
        <span class="d-flex">
            <input id="visibility-sm" type="number" min="0" step="0.25" value="10" />
            <span>SM</span>
        </span>
    </div>
    <div>
        <label for="visibility-meters">Visibility m</label>
        <span class="d-flex">
            <input id="visibility-meters" type="number" min="0" step="100" value="9999" />
            <span>m</span>
        </span>
    </div>
</div>
        `;
    }
    connectedCallback() {
        const visibilitySm = document.getElementById("visibility-sm");
        const visibilityMeters = document.getElementById("visibility-meters");
        if (visibilitySm instanceof HTMLInputElement && visibilityMeters instanceof HTMLInputElement) {
            visibilitySm.addEventListener("input", () => {
                visibilityMeters.valueAsNumber = Math.round((visibilitySm.valueAsNumber * 1609.344) / 100) * 100;
            });
            visibilityMeters.addEventListener("input", () => {
                visibilitySm.valueAsNumber =
                    visibilityMeters.valueAsNumber === 9999
                        ? 10
                        : Math.round(visibilityMeters.valueAsNumber / 1609.344 / 0.25) * 0.25;
            });
            visibilitySm.valueAsNumber =
                visibilityMeters.valueAsNumber === 9999
                    ? 10
                    : Math.round(visibilityMeters.valueAsNumber / 1609.344 / 0.25) * 0.25;
        }
    }
    static registerElement() {
        customElements.define("startgeraet-visibility", VisibilityWebComponent);
    }
}
