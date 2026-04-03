import AeroflyAirports from "@fboes/aerofly-data/data/airport-coordinates.json" with { type: "json" };
import type { AeroflyAirportCoordinates } from "@fboes/aerofly-data/data/airport-coordinates.json";

export type AeroflyAirportSet = {
    code: string;
    name: string;
    lat: number;
    lon: number;
};

/**
 * Find detail data for Aerofly FS airports.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export class AeroflyAirportService {
    static getAllAirports(): AeroflyAirportCoordinates[] {
        return AeroflyAirports;
    }

    static getAirportByIcaoCode(icaoCodeAirport: string): AeroflyAirportSet | undefined {
        const airport = AeroflyAirports.find((airport) => airport[0].toLowerCase() === icaoCodeAirport.toLowerCase());

        return airport
            ? {
                  code: airport[0],
                  name: airport[1],
                  lat: airport[2],
                  lon: airport[3],
              }
            : undefined;
    }
}
