import AeroflyAirports from "@fboes/aerofly-data/data/airport-coordinates.json" with { type: "json" };
/**
 * Find detail data for Aerofly FS airports.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export class AeroflyAirportCoordinatesService {
    static getAllAirports() {
        return AeroflyAirports;
    }
    static getAirportByIcaoCode(icaoCodeAirport) {
        return AeroflyAirports.find((airport) => airport[0].toLowerCase() === icaoCodeAirport.toLowerCase());
    }
}
