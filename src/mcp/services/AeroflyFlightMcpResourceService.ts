import { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import { AeroflyAircraftService } from "../../core/services/AeroflyAircraftService.js";
import { AeroflyAirportService, AeroflyAirportSet } from "../../core/services/AeroflyAirportService.js";
import { Resource, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { ResourceServer } from "../server/ResourceServer.js";

export type AeroflyFlightMcpResourceServiceAircraft = {
    aeroflyCode: string;
    icaoCode: string;
    name: string;
    nameFull: string;
    tags: string[];
};

export class AeroflyFlightMcpResourceService {
    getAircraftList(): AeroflyFlightMcpResourceServiceAircraft[] {
        return AeroflyAircraftService.getAllAircraftLiveries().map((a) => {
            return {
                aeroflyCode: a.aeroflyCode,
                icaoCode: a.icaoCode,
                name: a.name,
                nameFull: a.nameFull,
                tags: a.tags,
            };
        });
    }

    getAircraft(code: string): AeroflyAircraft {
        const aircraft = AeroflyAircraftService.getAircraft(code) ?? AeroflyAircraftService.getAircraftByIcaoCode(code);

        if (aircraft === undefined) {
            throw new McpError(
                ErrorCode.InvalidRequest,
                `Could not find aircraft by Aerofly Code / ICAO code ${code}`,
                {
                    hint: `Obviously the aircraft does not exist in Aerofly FS 4. Please refer to the list of available aircraft, and use the aeroflyCode.`,
                },
            );
        }

        return aircraft;
    }

    getAircraftRessources(): Resource[] {
        return [AeroflyAircraftService.getAircraft("a320"), AeroflyAircraftService.getAircraft("c172")]
            .filter((a) => a !== undefined)
            .map((a): Resource => {
                return {
                    uri: `${ResourceServer.URL_AIRCRAFT}/${a.aeroflyCode}`,
                    name: `Aircraft: ${a.nameFull}`,
                    description: `Detailed aircraft information on ${a.nameFull}`,
                    mimeType: "application/json",
                };
            });
    }

    getAircraftTags(): string[] {
        const tags: Set<string> = new Set();
        AeroflyAircraftService.getAllAircraftLiveries().forEach((a) => {
            a.tags.forEach((t) => {
                tags.add(t);
            });
        });

        return [...tags];
    }

    searchAircraft({
        query = undefined,
        tags = undefined,
        minimumRangeNm = undefined,
        minimumCruiseSpeedKts = undefined,
    }: {
        query?: string | undefined;
        tags?: string[] | undefined;
        minimumRangeNm?: number | undefined;
        minimumCruiseSpeedKts?: number | undefined;
    } = {}): AeroflyAircraft[] {
        const queryNormalized = query !== undefined && query.trim() !== "" ? query.trim().toLowerCase() : undefined;
        const tagsNormalized =
            tags !== undefined && tags.length
                ? tags.map((t) => t.trim().toLowerCase()).filter((t) => t !== "")
                : undefined;

        return AeroflyAircraftService.getAllAircraftLiveries().filter((a) => {
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

    getAirport(icaoCode: string): AeroflyAirportSet {
        const airport = AeroflyAirportService.getAirportByIcaoCode(icaoCode);

        if (airport === undefined) {
            throw new McpError(ErrorCode.InvalidRequest, `Could not find airport by ICAO code ${icaoCode}`, {
                hint: `Obviously the airport does not exist in Aerofly FS 4. Please choose a different airport if you need to take-off or land at this airport.`,
            });
        }
        return airport;
    }

    searchAirports({
        query = undefined,
    }: {
        query?: string | undefined;
    } = {}): AeroflyAirportSet[] {
        const queryNormalized = query !== undefined && query.trim() !== "" ? query.trim().toLowerCase() : undefined;

        if (queryNormalized === undefined) {
            throw new McpError(
                ErrorCode.InvalidRequest,
                `You need to supply at least one search parameter, otherwise the list of results will contain all the worlds airports.`,
            );
        }
        return AeroflyAirportService.getAllAirports().filter((a) => {
            let returnThis = true;
            if (queryNormalized !== undefined) {
                returnThis &&= a.code === queryNormalized || a.name.toLowerCase().includes(queryNormalized);
            }

            return returnThis;
        });
    }

    getAirportRessources(): Resource[] {
        return [AeroflyAirportService.getAirportByIcaoCode("KEYW"), AeroflyAirportService.getAirportByIcaoCode("EHAM")]
            .filter((a) => a !== undefined)
            .map((a): Resource => {
                return {
                    uri: `${ResourceServer.URL_AIRPORTS}/${a.code}`,
                    name: `Airport: ${a.name}`,
                    description: `Detailed airport information on ${a.name}`,
                    mimeType: "application/json",
                };
            });
    }
}
