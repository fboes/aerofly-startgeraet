import { ExportWebComponent } from "./ExportWebComponent.js";
import { ImportSimBriefWebComponent } from "./ImportSimBriefWebComponent.js";
import { ImportWebComponent } from "./ImportWebComponent.js";
import { MetarImportWebComponent } from "./MetarImportWebComponent.js";
import { registerElement } from "../util/registerElement.js";

export class ImportExportWebComponent extends HTMLElement {
    private isInitialized = false;

    private initialize() {
        ImportWebComponent.registerElement();
        ImportSimBriefWebComponent.registerElement();
        ExportWebComponent.registerElement();
        MetarImportWebComponent.registerElement();

        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3><startgeraet-icon icon="folder"></startgeraet-icon>&nbsp;Import / export</h3>
<div class="d-flex">
    <startgeraet-import></startgeraet-import>
    <startgeraet-export></startgeraet-export>
    <startgeraet-import-simbrief></startgeraet-import-simbrief>
    <startgeraet-metar-import></startgeraet-metar-import>
    <div class="d-flex form-group">
        <button id="mission-generator" disabled="disabled">Mission generator</button>
    </div>
</div>
        `;
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
    }

    static registerElement() {
        registerElement("startgeraet-import-export", ImportExportWebComponent);
    }
}
