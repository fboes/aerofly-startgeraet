import { Config, CONFIG_DEFAULTS, type ConfigStore } from "../../core/io/Config.js";
import Store from "electron-store";

/**
 * Use this `Config` for Electron apps.
 */
export class ConfigElectron extends Config {
    protected readonly conf: ConfigStore = new Store({
        defaults: CONFIG_DEFAULTS,
    });
}

export const CONFIG_ELECTRON = new ConfigElectron();
