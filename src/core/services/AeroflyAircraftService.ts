import AeroflyAircraftLiveries from "@fboes/aerofly-data/data/aircraft-liveries.json" with { type: "json" };
import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";

/**
 * Find detail data for Aerofly FS aircraft and liveries.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export class AeroflyAircraftService {
    getAllAircraftLiveries(): AeroflyAircraft[] {
        return AeroflyAircraftLiveries;
    }

    getAircraft(aeroflyCodeAircraft: string): AeroflyAircraft | undefined {
        return AeroflyAircraftLiveries.find((aircraft) => aircraft.aeroflyCode === aeroflyCodeAircraft);
    }

    getAircraftByIcaoCode(icaoCodeAircraft: string): AeroflyAircraft | undefined {
        return AeroflyAircraftLiveries.find(
            (aircraft) => aircraft.icaoCode.toLowerCase() === icaoCodeAircraft.toLowerCase(),
        );
    }

    getLiveryForAircraft(
        aircraft: AeroflyAircraft | undefined,
        aeroflyCodeLivery: string,
    ): AeroflyAircraftLivery | undefined {
        return aircraft?.liveries.find((livery) => livery.aeroflyCode === aeroflyCodeLivery);
    }

    getLiveryForAircraftByIcaoCode(
        aircraft: AeroflyAircraft | undefined,
        icaoCodeLivery: string,
    ): AeroflyAircraftLivery | undefined {
        return aircraft?.liveries.find((livery) => livery.icaoCode?.toLowerCase() === icaoCodeLivery.toLowerCase());
    }
}
