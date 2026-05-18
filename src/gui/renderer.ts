import { AeroflyFlightService, ApplicationService, AeroflyAircraftService, Process } from "./preload.js";
import { AppWebComponent } from "./web-components/structure/AppWebComponent.js";

declare global {
    interface Window {
        process: Process;
        applicationService: ApplicationService;
        aeroflyFlightService: AeroflyFlightService;
        aeroflyAircraftService: AeroflyAircraftService;
    }
}

AppWebComponent.registerElement();
