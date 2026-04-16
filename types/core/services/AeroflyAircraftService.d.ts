import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";
/**
 * Find detail data for Aerofly FS aircraft and liveries.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export declare class AeroflyAircraftService {
    getAllAircraftLiveries(): AeroflyAircraft[];
    getAircraft(aeroflyCodeAircraft: string): AeroflyAircraft | undefined;
    getAircraftByIcaoCode(icaoCodeAircraft: string): AeroflyAircraft | undefined;
    getLiveryForAircraft(
        aircraft: AeroflyAircraft | undefined,
        aeroflyCodeLivery: string,
    ): AeroflyAircraftLivery | undefined;
    getLiveryForAircraftByIcaoCode(
        aircraft: AeroflyAircraft | undefined,
        icaoCodeLivery: string,
    ): AeroflyAircraftLivery | undefined;
}
//# sourceMappingURL=AeroflyAircraftService.d.ts.map
