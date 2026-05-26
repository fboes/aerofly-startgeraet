export class ImportWebComponent extends HTMLElement {
    constructor() {
        super();
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button commandfor="dialog-import" command="show-modal" title="Import flight plan from file">Load flight plan</button>

<dialog id="dialog-import">
  <h3>Flight plan import</h3>
  <div class="d-flex">
    <section class="d-flex">
      <label for="import-file">Import flight plan from file</label>
      <input id="import-file" type="file" accept=".mcf,.tmc,.fpl,.pln,.fms" class="w-100" />
    </section>
  </div>

  <button commandfor="dialog-import" command="close" title="Close">✕</button>
</dialog>
        `;
    }
    static registerElement() {
        customElements.define("startgeraet-import", ImportWebComponent);
    }
}
