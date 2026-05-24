export class ImportSimBriefWebComponent extends HTMLElement {
    constructor() {
        super();
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button commandfor="dialog-simbrief" command="show-modal">Import from SimBrief</button>

<dialog id="dialog-simbrief" closedby="any">
  <h3>Flight plan import</h3>

  <div class="d-flex">

    <section class="d-flex">
      <div class="form-group">
        <label for="settings-simbriefusername">SimBrief username</label>
        <input id="settings-simbriefusername" type="text" pattern="[A-Za-z0-9]+" />
      </div>
      <button id="import-simbrief">Import flight plan from SimBrief</button>
    </section>
  </div>

  <button commandfor="dialog-simbrief" command="close" title="Close">✕</button>
</dialog>
        `;
    }
    static registerElement() {
        customElements.define("startgeraet-import-simbrief", ImportSimBriefWebComponent);
    }
}
