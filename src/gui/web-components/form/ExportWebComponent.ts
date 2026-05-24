export class ExportWebComponent extends HTMLElement {
    constructor() {
        super();
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button commandfor="dialog-export" command="show-modal">Export to file</button>

<dialog id="dialog-export">
  <h3>Flight plan export</h3>
  <div class="d-flex">
    <section class="d-flex">
      <div class="form-group">
        <label for="export-filetype">Export file type</label>
        <select id="export-filetype">
          <option value="mcf">Aerofly MCF flight plan file</option>
          <option value="tmc">Aerofly TMC custom user missions file</option>
          <option value="geojson">GeoJSON file</option>
          <option value="kml">Keyhole Markup Language (KML) file</option>
        </select>
      </div>
      <button id="export-file">Export flight plan to file</button>
    </section>
  </div>

  <button commandfor="dialog-export" command="close" title="Close">✕</button>
</dialog>
        `;
    }

    static registerElement() {
        customElements.define("startgeraet-export", ExportWebComponent);
    }
}
