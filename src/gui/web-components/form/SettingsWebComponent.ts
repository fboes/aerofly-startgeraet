import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
import type { ConfigTheme } from "../../../core/io/Config.js";

export type SettingsWebComponentState = {
    mainMcfFilePath: string;
    theme: ConfigTheme;
    fontSizePercent: number;
};

export class SettingsWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        mainMcfFilePath: HTMLInputElement;
        mainMcfFilePathChooser: HTMLButtonElement;
        theme: HTMLSelectElement;
        fontSizePercent: HTMLSelectElement;
    };

    get state(): SettingsWebComponentState {
        return {
            mainMcfFilePath: this.elements.mainMcfFilePath.value,
            theme: this.elements.theme.value as ConfigTheme,
            fontSizePercent: Number(this.elements.fontSizePercent.value),
        };
    }

    private initialize() {
        this.innerHTML = `\
<button id="open-dialog-settings" commandfor="dialog-settings" command="show-modal" title="Open settings" class="icon"><startgeraet-icon icon="gear">
</startgeraet-icon></button>

<dialog id="dialog-settings" closedby="any">
    <h2>Settings</h2>

    <section>
        <div class="form-group">
            <label for="settings-mainmcffilepath"><code>main.mcf</code> file path</label>
            <span class="d-flex">
                <input id="settings-mainmcffilepath" type="text" required />
                <button id="choose-mainmcffilepath">Choose</button>
            </span>
        </div>
        <div class="form-group">
            <label for="settings-theme">Theme</label>
            <select id="settings-theme">
                <option value="system">System settings</option>
                <option value="light">Light mode</option>
                <option value="dark">Dark mode</option>
            </select>
        </div>
        <div class="form-group">
            <label for="settings-fontsizepercent">Font Size</label>
            <select id="settings-fontsizepercent">
                <option value="87.5">Small</option>
                <option value="93.75">Medium</option>
                <option value="100">Large</option>
            </select>
        </div>
    </section>

    <button commandfor="dialog-settings" command="close" title="Close">✕</button>
</dialog>
        `;

        this.elements = {
            mainMcfFilePath: this.querySelector("#settings-mainmcffilepath") as HTMLInputElement,
            mainMcfFilePathChooser: this.querySelector("#choose-mainmcffilepath") as HTMLButtonElement,
            theme: this.querySelector("#settings-theme") as HTMLSelectElement,
            fontSizePercent: this.querySelector("#settings-fontsizepercent") as HTMLSelectElement,
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.subscribeToStateUpdates((state) => {
            this.elements.mainMcfFilePath.value = state.config.mainMcfFilePath ?? "";
            this.elements.theme.value = state.config.theme ?? "system";

            const fontSize = state.config.fontSizePercent ?? 93.75;
            this.elements.fontSizePercent.value = fontSize.toString();
            document.documentElement.style.fontSize = `${fontSize}%`;
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
