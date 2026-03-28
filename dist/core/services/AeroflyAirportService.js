import AeroflyAirports from "@fboes/aerofly-data/data/airport-coordinates.json" with { type: "json" };
/**
 * Find detail data for Aerofly FS airports.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export class AeroflyAirportService {
    static getAllAirports() {
        return AeroflyAirports;
    }
    static getAirportByIcaoCode(icaoCodeAirport) {
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
