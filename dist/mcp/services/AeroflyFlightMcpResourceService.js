import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getAllAeroflyAircraftWithLiveries, getAeroflyAircraft, getAeroflyAircraftByIcaoCode, } from "../../core/services/getAeroflyAircraft.js";
import { getAeroflyAirportByIcaoCode, getAllAeroflyAirports } from "../../core/services/getAeroflyAirport.js";
import { RESOURCE_AIRCRAFT, RESOURCE_AIRPORTS } from "../registry/registerResourceHandlers.js";
export function getAircraftList() {
    return getAllAeroflyAircraftWithLiveries().map((a) => {
        return {
            aeroflyCode: a.aeroflyCode,
            icaoCode: a.icaoCode,
            name: a.name,
            nameFull: a.nameFull,
            tags: a.tags,
        };
    });
}
export function getAircraft(code) {
    const aircraft = getAeroflyAircraft(code) ?? getAeroflyAircraftByIcaoCode(code);
    if (aircraft === undefined) {
        throw new McpError(ErrorCode.InvalidRequest, `Could not find aircraft by Aerofly Code / ICAO code ${code}`, {
            hint: `Obviously the aircraft does not exist in Aerofly FS 4. Please refer to the list of available aircraft, and use the aeroflyCode.`,
        });
    }
    return aircraft;
}
export function getAircraftRessources() {
    return [getAeroflyAircraft("a320"), getAeroflyAircraft("c172")]
        .filter((a) => a !== undefined)
        .map((a) => {
        return {
            uri: `${RESOURCE_AIRCRAFT}/${a.aeroflyCode}`,
            name: `Aircraft: ${a.nameFull}`,
            description: `Detailed aircraft information on ${a.nameFull}`,
            mimeType: "application/json",
        };
    });
}
export function getAircraftTags() {
    const tags = new Set();
    getAllAeroflyAircraftWithLiveries().forEach((a) => {
        a.tags.forEach((t) => {
            tags.add(t);
        });
    });
    return [...tags];
}
export function searchAircraft({ query = undefined, tags = undefined, minimumRangeNm = undefined, minimumCruiseSpeedKts = undefined, } = {}) {
    const queryNormalized = query !== undefined && query.trim() !== "" ? query.trim().toLowerCase() : undefined;
    const tagsNormalized = tags !== undefined && tags.length ? tags.map((t) => t.trim().toLowerCase()).filter((t) => t !== "") : undefined;
    return getAllAeroflyAircraftWithLiveries().filter((a) => {
        let returnThis = true;
        if (queryNormalized !== undefined) {
            returnThis &&=
                a.aeroflyCode === queryNormalized ||
                    a.icaoCode === queryNormalized.toUpperCase() ||
                    a.nameFull.toLowerCase().includes(queryNormalized) ||
                    a.liveries.filter((l) => l.name.toLowerCase().includes(queryNormalized)).length > 0;
        }
        if (tagsNormalized !== undefined) {
            returnThis &&= a.tags.filter((t) => tagsNormalized.includes(t)).length > 0;
        }
        if (minimumRangeNm !== undefined) {
            returnThis &&= a.maximumRangeNm > minimumRangeNm;
        }
        if (minimumCruiseSpeedKts !== undefined) {
            returnThis &&= a.cruiseSpeedKts > minimumCruiseSpeedKts;
        }
        return returnThis;
    });
}
export function getAirport(icaoCode) {
    const airport = getAeroflyAirportByIcaoCode(icaoCode);
    if (airport === undefined) {
        throw new McpError(ErrorCode.InvalidRequest, `Could not find airport by ICAO code ${icaoCode}`, {
            hint: `Obviously the airport does not exist in Aerofly FS 4. Please choose a different airport if you need to take-off or land at this airport.`,
        });
    }
    return airport;
}
export function searchAirports({ query = undefined, geoQuery = undefined, } = {}) {
    const queryNormalized = query !== undefined && query.trim() !== "" ? query.trim().toLowerCase() : undefined;
    if (queryNormalized === undefined && geoQuery === undefined) {
        throw new McpError(ErrorCode.InvalidRequest, `You need to supply at least one search parameter, otherwise the list of results will contain all the worlds airports.`);
    }
    let geoQueryNormalized = undefined;
    const haversineKm = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };
    if (geoQuery !== undefined) {
        const latDelta = geoQuery.radiusKm / 111;
        const lngDelta = geoQuery.radiusKm / (111 * Math.cos((geoQuery.latitude * Math.PI) / 180));
        geoQueryNormalized = {
            minLongitude: geoQuery.longitude - lngDelta,
            maxLongitude: geoQuery.longitude + lngDelta,
            minLatitude: geoQuery.latitude - latDelta,
            maxLatitude: geoQuery.latitude + latDelta,
        };
    }
    return getAllAeroflyAirports().filter((a) => {
        let returnThis = true;
        if (queryNormalized !== undefined) {
            returnThis &&= a.code === queryNormalized || a.name.toLowerCase().includes(queryNormalized);
        }
        if (geoQueryNormalized !== undefined) {
            returnThis &&=
                geoQueryNormalized.minLongitude <= a.lon &&
                    geoQueryNormalized.maxLongitude >= a.lon &&
                    geoQueryNormalized.minLatitude <= a.lat &&
                    geoQueryNormalized.maxLatitude >= a.lat;
            if (returnThis && geoQuery !== undefined) {
                returnThis &&= haversineKm(geoQuery.latitude, geoQuery.longitude, a.lat, a.lon) <= geoQuery.radiusKm;
            }
        }
        return returnThis;
    });
}
export function getAirportRessources() {
    return [getAeroflyAirportByIcaoCode("KEYW"), getAeroflyAirportByIcaoCode("EHAM")]
        .filter((a) => a !== undefined)
        .map((a) => {
        return {
            uri: `${RESOURCE_AIRPORTS}/${a.code}`,
            name: `Airport: ${a.name}`,
            description: `Detailed airport information on ${a.name}`,
            mimeType: "application/json",
        };
    });
}
