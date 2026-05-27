export class ExportWebComponent extends HTMLElement {
    private isInitialized = false;

    private initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button commandfor="dialog-export" command="show-modal" title="Export flight plan to file">Save flight plan</button>

<dialog id="dialog-export">
  <h3>Flight plan export</h3>

  <section class="d-flex">
    <div class="form-group w-100">
      <label for="export-filetype">Export file type</label>
      <select id="export-filetype">
        <option value="mcf">Aerofly MCF flight plan file</option>
        <option value="tmc">Aerofly TMC custom user missions file</option>
        <option value="geojson">GeoJSON file</option>
        <option value="kml">Keyhole Markup Language (KML) file</option>
      </select>
    </div>
    <button id="export-file" class="w-100">Export flight plan to file</button>
  </section>

  <button commandfor="dialog-export" command="close" title="Close">✕</button>
</dialog>
        `;
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
    }

    static registerElement() {
        customElements.define("startgeraet-export", ExportWebComponent);
    }
}
