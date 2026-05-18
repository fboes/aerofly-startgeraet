import { AeroflyFlightBridge } from "./util/AeroflyFlightBridge.js";
import { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";
/**
 * @see https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way
 */
export type Process = {
    platform: NodeJS.Platform;
};
export type ApplicationService = {
    getApplicationName: () => Promise<string>;
    getApplicationVersion: () => Promise<string>;
};
export type AeroflyFlightService = {
    onSendFlightplan: (callback: (flightplan: AeroflyFlightBridge) => void) => void;
};
export type AeroflyAircraftService = {
    onSendAllAircraftLiveries: (callback: (aircraftLiveries: AeroflyAircraft[]) => void) => void;
    getLiveries: (aeroflyCode: string) => Promise<AeroflyAircraftLivery[]>;
};
//# sourceMappingURL=preload.d.ts.map
