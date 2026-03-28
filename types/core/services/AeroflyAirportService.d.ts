import type { AeroflyAirportCoordinates } from "@fboes/aerofly-data/data/airport-coordinates.json";
/**
 * Find detail data for Aerofly FS airports.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export declare class AeroflyAirportCoordinatesService {
  static getAllAirports(): AeroflyAirportCoordinates[];
  static getAirportByIcaoCode(icaoCodeAirport: string): AeroflyAirportCoordinates | undefined;
}
//# sourceMappingURL=AeroflyAirportService.d.ts.map
