import AeroflyAirports from "@fboes/aerofly-data/data/airport-coordinates.json" with { type: "json" };
import type { AeroflyAirportCoordinates } from "@fboes/aerofly-data/data/airport-coordinates.json";

/**
 * Find detail data for Aerofly FS airports.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export class AeroflyAirportCoordinatesService {
  static getAllAirports(): AeroflyAirportCoordinates[] {
    return AeroflyAirports;
  }

  static getAirportByIcaoCode(icaoCodeAirport: string): AeroflyAirportCoordinates | undefined {
    return AeroflyAirports.find((airport) => airport[0].toLowerCase() === icaoCodeAirport.toLowerCase());
  }
}
