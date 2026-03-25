import AeroflyAircraftLiveries from "@fboes/aerofly-data/data/aircraft-liveries.json" with { type: "json" };
/**
 * Find detail data for Aerofly FS aircraft and liveries.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export class AeroflyAircraftService {
    static getAllAircraftLiveries() {
        return AeroflyAircraftLiveries;
    }
    static getAircraft(aeroflyCodeAircraft) {
        return AeroflyAircraftLiveries.find((aircraft) => aircraft.aeroflyCode === aeroflyCodeAircraft);
    }
    static getAircraftByIcaoCode(icaoCodeAircraft) {
        return AeroflyAircraftLiveries.find((aircraft) => aircraft.icaoCode.toLowerCase() === icaoCodeAircraft.toLowerCase());
    }
    static getLiveryForAircraft(aircraft, aeroflyCodeLivery) {
        return aircraft?.liveries.find((livery) => livery.aeroflyCode === aeroflyCodeLivery);
    }
    static getLiveryForAircraftByIcaoCode(aircraft, icaoCodeLivery) {
        return aircraft?.liveries.find((livery) => livery.icaoCode?.toLowerCase() === icaoCodeLivery.toLowerCase());
    }
}
