import { type AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import { type Resource } from "@modelcontextprotocol/sdk/types.js";
export type AeroflyFlightMcpResourceServiceAircraft = {
    aeroflyCode: string;
    icaoCode: string;
    name: string;
    nameFull: string;
    tags: string[];
};
export type AeroflyFlightMcpResourceServiceAirport = {
    code: string;
    name: string;
    lon: number;
    lat: number;
};
export declare function getAircraftList(): AeroflyFlightMcpResourceServiceAircraft[];
export declare function getAircraft(code: string): AeroflyAircraft;
export declare function getAircraftRessources(): Resource[];
export declare function getAircraftTags(): string[];
export declare function searchAircraft({
    query,
    tags,
    minimumRangeNm,
    minimumCruiseSpeedKts,
}?: {
    query?: string | undefined;
    tags?: string[] | undefined;
    minimumRangeNm?: number | undefined;
    minimumCruiseSpeedKts?: number | undefined;
}): AeroflyAircraft[];
export declare function getAirport(icaoCode: string): AeroflyFlightMcpResourceServiceAirport;
export declare function searchAirports({
    query,
    geoQuery,
}?: {
    query?: string;
    geoQuery?: {
        longitude: number;
        latitude: number;
        radiusKm: number;
    };
}): AeroflyFlightMcpResourceServiceAirport[];
export declare function getAirportRessources(): Resource[];
//# sourceMappingURL=AeroflyFlightMcpResourceService.d.ts.map
