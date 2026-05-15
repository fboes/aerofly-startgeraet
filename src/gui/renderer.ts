import { ApplicationService, Process } from "./preload.js";
import { AppWebComponent } from "./web-components/AppWebComponent.js";

declare global {
    interface Window {
        process: Process;
        applicationService: ApplicationService;
    }
}

AppWebComponent.registerElement();
