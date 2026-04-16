import AeroflyAircraftLiveries from "@fboes/aerofly-data/data/aircraft-liveries.json" with { type: "json" };
/**
 * Find detail data for Aerofly FS aircraft and liveries.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export class AeroflyAircraftService {
    getAllAircraftLiveries() {
        return AeroflyAircraftLiveries;
    }
    getAircraft(aeroflyCodeAircraft) {
        return AeroflyAircraftLiveries.find((aircraft) => aircraft.aeroflyCode === aeroflyCodeAircraft);
    }
    getAircraftByIcaoCode(icaoCodeAircraft) {
        return AeroflyAircraftLiveries.find((aircraft) => aircraft.icaoCode.toLowerCase() === icaoCodeAircraft.toLowerCase());
    }
    getLiveryForAircraft(aircraft, aeroflyCodeLivery) {
        return aircraft?.liveries.find((livery) => livery.aeroflyCode === aeroflyCodeLivery);
    }
    getLiveryForAircraftByIcaoCode(aircraft, icaoCodeLivery) {
        return aircraft?.liveries.find((livery) => livery.icaoCode?.toLowerCase() === icaoCodeLivery.toLowerCase());
    }
}
