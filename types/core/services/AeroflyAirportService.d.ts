import type { AeroflyAirportCoordinatesObject } from "@fboes/aerofly-data/data/airport-coordinates-object.json";
/**
 * Find detail data for Aerofly FS airports.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export declare class AeroflyAirportService {
    getAllAirports(): AeroflyAirportCoordinatesObject[];
    getAirportByIcaoCode(icaoCodeAirport: string): AeroflyAirportCoordinatesObject | undefined;
}
//# sourceMappingURL=AeroflyAirportService.d.ts.map
