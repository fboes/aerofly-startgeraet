import type { AppState } from "./renderer/AppState.js";
export type Process = {
    platform: NodeJS.Platform;
};
export type ElectronAPI = {
    send: (channel: string, data?: unknown) => Promise<unknown>;
    onStateUpdate: (callback: (state: AppState) => void) => () => void;
};
//# sourceMappingURL=preload.d.ts.map