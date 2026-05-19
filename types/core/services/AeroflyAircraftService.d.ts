import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";
/**
 * Find detail data for Aerofly FS aircraft and liveries.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export declare function getAllAeroflyAircraftWithLiveries(): AeroflyAircraft[];
export declare function getAeroflyAircraft(aeroflyCodeAircraft: string): AeroflyAircraft | undefined;
export declare function getAeroflyAircraftByIcaoCode(icaoCodeAircraft: string): AeroflyAircraft | undefined;
export declare function getAeroflyLivery(aircraft: AeroflyAircraft | undefined, aeroflyCodeLivery: string): AeroflyAircraftLivery | undefined;
export declare function getAeroflyLiveryByIcaoCode(aircraft: AeroflyAircraft | undefined, icaoCodeLivery: string): AeroflyAircraftLivery | undefined;
//# sourceMappingURL=AeroflyAircraftService.d.ts.map