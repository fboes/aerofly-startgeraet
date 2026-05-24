import type { ElectronAPI, Process } from "./preload.js";
import { AppWebComponent } from "./web-components/structure/AppWebComponent.js";

declare global {
    interface Window {
        process: Process;
        electronAPI: ElectronAPI;
    }
}

AppWebComponent.registerElement();
