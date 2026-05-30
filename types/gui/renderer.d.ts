import type { ElectronAPI, Process } from "./preload.js";
declare global {
    interface Window {
        process: Process;
        electronAPI: ElectronAPI;
    }
}
//# sourceMappingURL=renderer.d.ts.map
