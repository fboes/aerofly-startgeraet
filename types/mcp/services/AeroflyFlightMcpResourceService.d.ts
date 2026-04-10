import { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import { AeroflyAirportSet } from "../../core/services/AeroflyAirportService.js";
import { Resource } from "@modelcontextprotocol/sdk/types.js";
export type AeroflyFlightMcpResourceServiceAircraft = {
    aeroflyCode: string;
    icaoCode: string;
    name: string;
    nameFull: string;
    tags: string[];
};
export declare class AeroflyFlightMcpResourceService {
    static readonly MIME_TYPE_RESPONSE = "application/json";
    static readonly RESOURCE_NAME_SPACE = "resource://aerofly";
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
    getAirport(icaoCode: string): AeroflyAirportSet;
    searchAirports({ query }?: { query?: string | undefined }): AeroflyAirportSet[];
    getAirportRessources(): Resource[];
}
//# sourceMappingURL=AeroflyFlightMcpResourceService.d.ts.map
