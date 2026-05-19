import type { AeroflyAirportCoordinatesObject } from "@fboes/aerofly-data/data/airport-coordinates-object.json";
/**
 * Find detail data for Aerofly FS airports.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export declare function getAllAeroflyAirports(): AeroflyAirportCoordinatesObject[];
export declare function getAeroflyAirportByIcaoCode(
    icaoCodeAirport: string,
): AeroflyAirportCoordinatesObject | undefined;
//# sourceMappingURL=AeroflyAirportService.d.ts.map
