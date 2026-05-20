import AeroflyAircraftLiveries from "@fboes/aerofly-data/data/aircraft-liveries.json" with { type: "json" };
/**
 * Find detail data for Aerofly FS aircraft and liveries.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export function getAllAeroflyAircraftWithLiveries() {
    return AeroflyAircraftLiveries;
}
export function getAeroflyAircraft(aeroflyCodeAircraft) {
    return AeroflyAircraftLiveries.find((aircraft) => aircraft.aeroflyCode === aeroflyCodeAircraft);
}
export function getAeroflyAircraftByIcaoCode(icaoCodeAircraft) {
    return AeroflyAircraftLiveries.find((aircraft) => aircraft.icaoCode.toLowerCase() === icaoCodeAircraft.toLowerCase());
}
export function getAeroflyLivery(aircraft, aeroflyCodeLivery) {
    return aircraft?.liveries.find((livery) => livery.aeroflyCode === aeroflyCodeLivery);
}
export function getAeroflyLiveryByIcaoCode(aircraft, icaoCodeLivery) {
    return aircraft?.liveries.find((livery) => livery.icaoCode?.toLowerCase() === icaoCodeLivery.toLowerCase());
}
