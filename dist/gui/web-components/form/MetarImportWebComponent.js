export class MetarImportWebComponent extends HTMLElement {
    constructor() {
        super();
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button commandfor="dialog-metar" command="show-modal">Fetch METAR</button>

<dialog id="dialog-metar">
  <h3>Fetch METAR</h3>
  <div class="d-flex">
    <section class="d-flex">
        KASE / KEYW
    </section>
  </div>

  <button commandfor="dialog-metar" command="close" title="Close">✕</button>
</dialog>
        `;
    }
    static registerElement() {
        customElements.define("startgeraet-metar-import", MetarImportWebComponent);
    }
}
