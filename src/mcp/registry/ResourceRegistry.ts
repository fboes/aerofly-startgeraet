import fs from "node:fs";
import path from "node:path";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AeroflyFlightMcpResourceService } from "../services/AeroflyFlightMcpResourceService.js";
import * as ZodExtra from "../../core/util/ZodExtra.js";
import { CallToolResult, ReadResourceResult, ToolAnnotations } from "@modelcontextprotocol/sdk/types";
import { AviationWeatherApi } from "../../core/api/AviationWeatherApi.js";
import { OpenTopoDataApi } from "../../core/api/OpenTopoDataApi.js";
import { JSONstringify, returnMcpToolSimpleResult } from "../util/McpHelper.js";

type Variables = Record<string, string | string[]>;

const MIME_TYPE_RESPONSE = "application/json";
const RESOURCE_NAME_SPACE = "resource://aerofly";
export const RESOURCE_AIRCRAFT = `${RESOURCE_NAME_SPACE}/aircraft`;
export const RESOURCE_AIRCRAFT_TAGS = `${RESOURCE_NAME_SPACE}/aircraft-tags`;
export const RESOURCE_AIRPORTS = `${RESOURCE_NAME_SPACE}/airports`;
export const RESOURCE_RULES = `${RESOURCE_NAME_SPACE}/general-rules`;
export const TOOL_SEARCH_AIRCRAFT = "search-aicraft";
export const TOOL_SEARCH_AIRPORTS = "search-airports";
export const TOOL_SEARCH_NAVAIDS = "search-navaids";
export const TOOL_SEARCH_FIX = "search-waypoint-fix";
export const TOOL_GET_AIRPORT_DETAILS = "get-airport-details";
export const TOOL_GET_ELEVATION = "get-elevation";

export function registerResources(server: McpServer, resourceService: AeroflyFlightMcpResourceService) {
    server.registerResource(
        "aircraft",
        RESOURCE_AIRCRAFT,
        {
            description: `A compressed list of all aircraft available in Aerofly FS 4. This provides the internal aeroflyCode for a given aircraft. There is also a resource providing detailed information for a given aeroflyCode.`,
            mimeType: MIME_TYPE_RESPONSE,
        },
        (uri: URL): ReadResourceResult => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: MIME_TYPE_RESPONSE,
                    text: JSONstringify(resourceService.getAircraftList()),
                },
            ],
        }),
    );

    server.registerResource(
        "aircraft-detail",
        new ResourceTemplate(`${RESOURCE_AIRCRAFT}/{aeroflyCode}`, {
            list: () => ({
                resources: resourceService.getAircraftRessources(),
            }),
        }),
        {
            description: `Detailed information for a specific aircraft matching the Aerofly FS4 aircraft code given by \`aeroflyCode\` (string), if available in Aerofly FS 4. This gives you additional technical data like range and cruise speed, as well as a list of available liveries.`,
            mimeType: MIME_TYPE_RESPONSE,
        },
        (uri: URL, { aeroflyCode }: Variables): ReadResourceResult => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: MIME_TYPE_RESPONSE,
                    text: JSONstringify(resourceService.getAircraft(String(aeroflyCode))),
                },
            ],
        }),
    );

    server.registerResource(
        "aircraft-tags",
        RESOURCE_AIRCRAFT_TAGS,
        {
            description: `A list of all tags which aircraft in Aerofly FS 4 can be searched by.`,
            mimeType: MIME_TYPE_RESPONSE,
        },
        (uri: URL): ReadResourceResult => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: MIME_TYPE_RESPONSE,
                    text: JSONstringify(resourceService.getAircraftTags()),
                },
            ],
        }),
    );

    server.registerResource(
        "airport",
        new ResourceTemplate(`${RESOURCE_AIRPORTS}/{icaoCode}`, {
            list: () => ({
                resources: resourceService.getAirportRessources(),
            }),
        }),
        {
            description: `Detailed information for a specific airport / heliport matching the ICAO code given by \`icaoCode\` (string), if available in Aerofly FS 4. This will give you the ICAO code, name, longitude and latitude of the airport. Be aware that the runways and parking positions available are not available in this MCP server and need to be fetched from online sources.`,
            mimeType: MIME_TYPE_RESPONSE,
        },
        (uri: URL, { icaoCode }: Variables): ReadResourceResult => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: MIME_TYPE_RESPONSE,
                    text: JSONstringify(resourceService.getAirport(String(icaoCode))),
                },
            ],
        }),
    );

    server.registerResource(
        "general-rules",
        RESOURCE_RULES,
        {
            description: "General rules and constraints that apply to all workflows",
            mimeType: "text/markdown",
        },
        (uri: URL): ReadResourceResult => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: "text/markdown",
                    text: fs.readFileSync(
                        path.join(import.meta.dirname, "../../..", "docs/mcp", "resource-general-rules.md"),
                        "utf-8",
                    ),
                },
            ],
        }),
    );
}

export function registerTools(server: McpServer, resourceService: AeroflyFlightMcpResourceService) {
    const annotations: ToolAnnotations = {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
    };

    server.registerTool(
        TOOL_SEARCH_AIRCRAFT,
        {
            title: `Search Aerofly FS 4 aircraft`,
            description: `Search for aircraft by ICAO code, Aerofly code, tag, maximum range, maximum payload. All search properties are linked by \`AND\`. WIll return additional information like payload, cruise speed, existing liveries etc.`,
            inputSchema: {
                query: z
                    .string()
                    .optional()
                    .describe(
                        `Aerofly FS 4 code, ICAO code, (partial) name of aircraft or (partial) name of livery name available for aircraft. Call ${RESOURCE_AIRCRAFT} to see a list of all available ICAO or Aerofly FS4 codes.`,
                    ),
                tags: z
                    .array(z.string().lowercase())
                    .optional()
                    .describe(
                        `Tags like 'airliner' or 'military'. If multiple tags are submitted, the will be linked via \`OR\`. all ${RESOURCE_AIRCRAFT_TAGS} to see a list of all available tags.`,
                    ),
                minimumRangeNm: z.number().positive().optional().describe("Minimum range in nautical miles."),
                minimumCruiseSpeedKts: z.number().positive().optional().describe("Minimum cruise speed in knots."),
            },
            annotations,
        },
        ({
            query,
            tags,
            minimumRangeNm,
            minimumCruiseSpeedKts,
        }: {
            query?: string;
            tags?: string[];
            minimumRangeNm?: number;
            minimumCruiseSpeedKts?: number;
        }): CallToolResult =>
            returnMcpToolSimpleResult(
                resourceService.searchAircraft({ query, tags, minimumRangeNm, minimumCruiseSpeedKts }),
            ),
    );

    server.registerTool(
        TOOL_SEARCH_AIRPORTS,
        {
            title: `Search Aerofly FS 4 airports`,
            description: `Search for airports / heliports by ICAO code, (partial) name and/or geographical location. All search properties are linked by \`AND\`.`,
            inputSchema: {
                query: z
                    .string()
                    .optional()
                    .describe(
                        `Airport ICAO code or (partial) name of airport. Will only find airports present in Aerofly FS 4.`,
                    ),
                geoQuery: ZodExtra.geoQuery(),
            },
            annotations,
        },
        ({
            query,
            geoQuery,
        }: {
            query?: string;
            geoQuery?: { longitude: number; latitude: number; radiusKm: number };
        }): CallToolResult => returnMcpToolSimpleResult(resourceService.searchAirports({ query, geoQuery })),
    );

    server.registerTool(
        TOOL_GET_AIRPORT_DETAILS,
        {
            title: `Get airport details`,
            description: `Get detailed airport / heliport information like runway data elevation (in meters MSL). Runway data will include identifiers, alignment, length (in feet), width (in feet), and surface type initials (Asphalt, Concrete, Grass, Water, Helipad).`,
            inputSchema: {
                icaoCode: z.string().length(4).describe("Airport ICAO code"),
            },
            annotations: {
                ...annotations,
                openWorldHint: true,
            },
        },
        async ({ icaoCode }: { icaoCode: string }): Promise<CallToolResult> =>
            returnMcpToolSimpleResult(await new AviationWeatherApi().fetchAirports([icaoCode])),
    );

    server.registerTool(
        TOOL_SEARCH_NAVAIDS,
        {
            title: `Search navigational aids`,
            description: `Search for navigational aids like NDBs and VORs depending on their geographical location from the Aviation Weather Center API. Will return geographical position, elevation (in meters MSL), identifier, type and frequency.`,
            inputSchema: {
                geoQuery: ZodExtra.geoQuery(),
            },
            annotations: {
                ...annotations,
                openWorldHint: true,
            },
        },
        async ({
            geoQuery,
        }: {
            geoQuery: { longitude: number; latitude: number; radiusKm: number };
        }): Promise<CallToolResult> =>
            returnMcpToolSimpleResult(
                await new AviationWeatherApi().fetchNavaidsByPosition(
                    geoQuery.longitude,
                    geoQuery.latitude,
                    geoQuery.radiusKm * 1000,
                ),
            ),
    );

    server.registerTool(
        TOOL_SEARCH_FIX,
        {
            title: `Search waypoints fixes`,
            description: `Search for waypoints and named fixes depending on their geographical location from the Aviation Weather Center API. Will return geographical position, identifier, and type.`,
            inputSchema: {
                geoQuery: ZodExtra.geoQuery(),
            },
            annotations: {
                ...annotations,
                openWorldHint: true,
            },
        },
        async ({
            geoQuery,
        }: {
            geoQuery: { longitude: number; latitude: number; radiusKm: number };
        }): Promise<CallToolResult> =>
            returnMcpToolSimpleResult(
                await new AviationWeatherApi().fetchFixByPosition(
                    geoQuery.longitude,
                    geoQuery.latitude,
                    geoQuery.radiusKm * 1000,
                ),
            ),
    );

    server.registerTool(
        TOOL_GET_ELEVATION,
        {
            title: `Get elevation data`,
            description: `Fetch elevation data from an external data for a set of geo coordinates, using the aster30m dataset. Will return an object with a property \`results\`, which will contain a set of results with elevation data given in meters above sea level. Elevation data may not be provided for the entire earth.`,
            inputSchema: {
                coordinates: z.array(ZodExtra.geoCoordinates()),
            },
            annotations: {
                ...annotations,
                openWorldHint: true,
            },
        },
        async ({
            coordinates,
        }: {
            coordinates: { longitude: number; latitude: number }[];
        }): Promise<CallToolResult> => {
            const topoApi = new OpenTopoDataApi();
            const results = await topoApi.fetch(
                coordinates.map((t) => ({
                    lat: t.latitude,
                    lng: t.longitude,
                })),
            );

            return returnMcpToolSimpleResult(results);
        },
    );
}
