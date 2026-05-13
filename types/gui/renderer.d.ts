import { ApplicationService, Process } from "./preload.js";
declare global {
    interface Window {
        process: Process;
        applicationService: ApplicationService;
    }
}
//# sourceMappingURL=renderer.d.ts.map
