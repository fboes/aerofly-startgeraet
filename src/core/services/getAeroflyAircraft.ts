import AeroflyAircraftLiveries from "@fboes/aerofly-data/data/aircraft-liveries.json" with { type: "json" };
import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";

/**
 * Find detail data for Aerofly FS aircraft and liveries.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export function getAllAeroflyAircraftWithLiveries(): AeroflyAircraft[] {
    return AeroflyAircraftLiveries;
}

export function findAeroflyAircraft(aeroflyCodeAircraft: string): AeroflyAircraft | undefined {
    return AeroflyAircraftLiveries.find((aircraft) => aircraft.aeroflyCode === aeroflyCodeAircraft);
}

export function findAeroflyAircraftByIcaoCode(icaoCodeAircraft: string): AeroflyAircraft | undefined {
    return AeroflyAircraftLiveries.find(
        (aircraft) => aircraft.icaoCode.toLowerCase() === icaoCodeAircraft.toLowerCase(),
    );
}

export function findAeroflyLivery(
    aircraft: AeroflyAircraft | undefined,
    aeroflyCodeLivery: string,
): AeroflyAircraftLivery | undefined {
    return aircraft?.liveries.find((livery) => livery.aeroflyCode === aeroflyCodeLivery);
}

export function findAeroflyLiveryByIcaoCode(
    aircraft: AeroflyAircraft | undefined,
    icaoCodeLivery: string,
): AeroflyAircraftLivery | undefined {
    return aircraft?.liveries.find((livery) => livery.icaoCode?.toLowerCase() === icaoCodeLivery.toLowerCase());
}

/**
 * Find Aerofly FS aircraft by a tag. Examples for tag search are "historical", "airliner", "helicopter", "military", "glider", "aerobatic", "general_aviation".
 */
export function findAeroflyAircraftByTag(tag: string): AeroflyAircraft[] {
    return AeroflyAircraftLiveries.filter((aircraft) => aircraft.tags?.includes(tag));
}
