import { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import { AeroflyAircraftService } from "../../core/services/AeroflyAircraftService.js";
import { AeroflyAirportService } from "../../core/services/AeroflyAirportService.js";
import { Resource } from "@modelcontextprotocol/sdk/types.js";
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
export declare class AeroflyFlightMcpResourceService {
    private aircraftService;
    private airportService;
    constructor(aircraftService: AeroflyAircraftService, airportService: AeroflyAirportService);
    getAircraftList(): AeroflyFlightMcpResourceServiceAircraft[];
    getAircraft(code: string): AeroflyAircraft;
    getAircraftRessources(): Resource[];
    getAircraftTags(): string[];
    searchAircraft({
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
    getAirport(icaoCode: string): AeroflyFlightMcpResourceServiceAirport;
    searchAirports({
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
    getAirportRessources(): Resource[];
}
//# sourceMappingURL=AeroflyFlightMcpResourceService.d.ts.map
