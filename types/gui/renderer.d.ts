import { AeroflyFlightService, ApplicationService, AeroflyAircraftService, Process } from "./preload.js";
declare global {
    interface Window {
        process: Process;
        applicationService: ApplicationService;
        aeroflyFlightService: AeroflyFlightService;
        aeroflyAircraftService: AeroflyAircraftService;
    }
}
//# sourceMappingURL=renderer.d.ts.map