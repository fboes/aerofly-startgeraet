import AeroflyAirports from "@fboes/aerofly-data/data/airport-coordinates-object.json" with { type: "json" };
import type { AeroflyAirportCoordinatesObject } from "@fboes/aerofly-data/data/airport-coordinates-object.json";

/**
 * Find detail data for Aerofly FS airports.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export function getAllAeroflyAirports(): AeroflyAirportCoordinatesObject[] {
    return AeroflyAirports;
}

export function getAeroflyAirportByIcaoCode(icaoCodeAirport: string): AeroflyAirportCoordinatesObject | undefined {
    return AeroflyAirports.find((airport) => airport.code.toUpperCase() === icaoCodeAirport.toUpperCase());
}
