import { AeroflyFlightBridge } from "./util/AeroflyFlightBridge.js";
export type Process = {
    platform: NodeJS.Platform;
};
export type ElectronAPI = {
    send: (channel: string, data?: unknown) => Promise<unknown>;
    onStateUpdate: (callback: (state: AeroflyFlightBridge) => void) => () => void;
};
//# sourceMappingURL=preload.d.ts.map
