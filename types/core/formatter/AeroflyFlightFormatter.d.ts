import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";
export declare class AeroflyFlightFormatter {
    static getAircraft(currentAircraft: AeroflyAircraft | undefined, currentLivery: AeroflyAircraftLivery | undefined): string;
    static getFuelAndPayload(aeroflyFlight: AeroflyFlight): string;
    static numberToString(num: number): string;
    static dateToString(date: Date): string;
}
//# sourceMappingURL=AeroflyFlightFormatter.d.ts.map