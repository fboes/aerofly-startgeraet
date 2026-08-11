import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";

export type SettingsWebComponentState = {
    mainMcfFilePath: string;
};

export class SettingsWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        mainMcfFilePath: HTMLInputElement;
        mainMcfFilePathChooser: HTMLButtonElement;
        // syncTimeOnStartup
    };

    get state(): SettingsWebComponentState {
        return {
            mainMcfFilePath: this.elements.mainMcfFilePath.value,
            // syncTimeOnStartup: this.elements.syncTimeOnStartup.value,
        };
    }

    private initialize() {
        this.innerHTML = `\
<button id="open-dialog-settings" commandfor="dialog-settings" command="show-modal" title="Open settings" class="icon"><startgeraet-icon icon="gear">
</startgeraet-icon></button>

<dialog id="dialog-settings" closedby="any">
  <h2>Settings</h2>

  <section>
    <label for="settings-mainmcffilepath"><code>main.mcf</code> file path</label>
    <span class="d-flex">
        <input id="settings-mainmcffilepath" type="text" required />
        <button id="choose-mainmcffilepath">Choose</button>
    </span>
  </section>

  <button commandfor="dialog-settings" command="close" title="Close">✕</button>
</dialog>
        `;

        this.elements = {
            mainMcfFilePath: this.querySelector("#settings-mainmcffilepath") as HTMLInputElement,
            mainMcfFilePathChooser: this.querySelector("#choose-mainmcffilepath") as HTMLButtonElement,
            // syncTimeOnStartup
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.subscribeToStateUpdates((state) => {
            this.elements.mainMcfFilePath.value = state.config.mainMcfFilePath ?? "";
            // syncTimeOnStartup
        });

        this.addEventListener("input", this.handleChange);
        this.elements.mainMcfFilePathChooser.addEventListener("click", this.handlePathChooserClick);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.removeEventListener("input", this.handleChange);
        this.elements.mainMcfFilePathChooser.removeEventListener("click", this.handlePathChooserClick);
    }

    handleChange = async () => {
        sendToMain("config:set", this.state);
    };

    handlePathChooserClick = async () => {
        sendToMain("config:choose-main-mcf-path", this.state);
    };

    static registerElement() {
        registerElement("startgeraet-settings", SettingsWebComponent);
    }
}
