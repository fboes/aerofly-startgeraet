import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";

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
<button id="open-dialog-settings" commandfor="dialog-settings" command="show-modal" title="Settings" class="icon">
<svg width="16" height="16" version="1.1" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <path
    d="m7 0-0.55273 2.209a6 6 0 0 0-1.4531 0.59961l-1.9746-1.1855-1.4141 1.4141 1.1895 1.9824a6 6 0 0 0-0.58594 1.4277l-2.209 0.55273v2l2.209 0.55273a6 6 0 0 0 0.57812 1.4141l-1.1816 1.9707 1.4141 1.4141 1.9551-1.1719a6 6 0 0 0 1.4727 0.61133l0.55273 2.209h2l0.55273-2.209a6 6 0 0 0 1.4434-0.59375l1.9238 1.1543 1.4141-1.4141-1.1504-1.918a6 6 0 0 0 0.60742-1.4668l2.209-0.55273v-2l-2.209-0.55273a6 6 0 0 0-0.61523-1.4785l1.1582-1.9316-1.4141-1.4141-1.9473 1.168a6 6 0 0 0-1.4199-0.58203l-0.55273-2.209zm1 5a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z"
    fill-rule="evenodd"
    stroke-width="1.2"
  ></path>
</svg>
</button>

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
        customElements.define("startgeraet-settings", SettingsWebComponent);
    }
}
