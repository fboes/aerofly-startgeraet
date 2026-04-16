import AeroflyAirports from "@fboes/aerofly-data/data/airport-coordinates-object.json" with { type: "json" };
/**
 * Find detail data for Aerofly FS airports.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export class AeroflyAirportService {
    getAllAirports() {
        return AeroflyAirports;
    }
    getAirportByIcaoCode(icaoCodeAirport) {
        return AeroflyAirports.find((airport) => airport.code.toUpperCase() === icaoCodeAirport.toUpperCase());
    }
}
