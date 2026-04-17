import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AeroflyFlightMcpResourceService } from "../services/AeroflyFlightMcpResourceService.js";
import { McpHelper } from "../util/McpHelper.js";
import { ZodExtra } from "../util/ZodExtra.js";
import { CallToolResult, ReadResourceResult, ToolAnnotations } from "@modelcontextprotocol/sdk/types";

type Variables = Record<string, string | string[]>;

export class ResourceRegistry {
    static readonly MIME_TYPE_RESPONSE = "application/json";
    static readonly RESOURCE_NAME_SPACE = "resource://aerofly";
    static readonly RESOURCE_AIRCRAFT = `${this.RESOURCE_NAME_SPACE}/aircraft`;
    static readonly RESOURCE_AIRCRAFT_TAGS = `${this.RESOURCE_NAME_SPACE}/aircraft-tags`;
    static readonly RESOURCE_AIRPORTS = `${this.RESOURCE_NAME_SPACE}/airports`;
    static readonly TOOL_SEARCH_AIRCRAFT = "search-aicraft";
    static readonly TOOL_SEARCH_AIRPORTS = "search-airports";

    static registerResources(server: McpServer, resourceService: AeroflyFlightMcpResourceService) {
        server.registerResource(
            "aircraft",
            this.RESOURCE_AIRCRAFT,
            {
                description: `A compressed list of all aircraft available in Aerofly FS 4. This provides the internal aeroflyCode for a given aircraft. There is also a resource providing detailed information for a given aeroflyCode.`,
                mimeType: this.MIME_TYPE_RESPONSE,
            },
            (uri: URL): ReadResourceResult => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: this.MIME_TYPE_RESPONSE,
                        text: McpHelper.JSONstringify(resourceService.getAircraftList()),
                    },
                ],
            }),
        );

        server.registerResource(
            "aircraft-detail",
            new ResourceTemplate(`${this.RESOURCE_AIRCRAFT}/{aeroflyCode}`, {
                list: () => ({
                    resources: resourceService.getAircraftRessources(),
                }),
            }),
            {
                description: `Detailed information for a specific aircraft matching the Aerofly FS4 aircraft code given by \`aeroflyCode\` (string), if available in Aerofly FS 4. This gives you additional technical data like range and cruise speed, as well as a list of available liveries.`,
                mimeType: this.MIME_TYPE_RESPONSE,
            },
            (uri: URL, { aeroflyCode }: Variables): ReadResourceResult => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: this.MIME_TYPE_RESPONSE,
                        text: McpHelper.JSONstringify(resourceService.getAircraft(String(aeroflyCode))),
                    },
                ],
            }),
        );

        server.registerResource(
            "aircraft-tags",
            this.RESOURCE_AIRCRAFT_TAGS,
            {
                description: `A list of all tags which are attached to aircraft in Aerofly FS 4.`,
                mimeType: this.MIME_TYPE_RESPONSE,
            },
            (uri: URL): ReadResourceResult => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: this.MIME_TYPE_RESPONSE,
                        text: McpHelper.JSONstringify(resourceService.getAircraftTags()),
                    },
                ],
            }),
        );

        server.registerResource(
            "airport",
            new ResourceTemplate(`${this.RESOURCE_AIRPORTS}/{icaoCode}`, {
                list: () => ({
                    resources: resourceService.getAirportRessources(),
                }),
            }),
            {
                description: `Detailed information for a specific airport matching the ICAO code given by \`icaoCode\` (string), if available in Aerofly FS 4. This will give you the ICAO code, name, longitude and latitude of the airport. Be aware that the runways and parking positions available are not available in this MCP server and need to be fetched from online sources.`,
                mimeType: this.MIME_TYPE_RESPONSE,
            },
            (uri: URL, { icaoCode }: Variables): ReadResourceResult => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: this.MIME_TYPE_RESPONSE,
                        text: McpHelper.JSONstringify(resourceService.getAirport(String(icaoCode))),
                    },
                ],
            }),
        );
    }

    // -----------------------------------------------------------------------------------------------------------------

    static registerTools(server: McpServer, resourceService: AeroflyFlightMcpResourceService) {
        const annotations: ToolAnnotations = {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        };

        server.registerTool(
            this.TOOL_SEARCH_AIRCRAFT,
            {
                title: `Search Aerofly FS 4 aircraft`,
                description: `Search aircraft by ICAO code, Aerofly code, tag, maximum range, maximum payload. All search properties are linked by \`AND\`.`,
                inputSchema: {
                    query: z
                        .string()
                        .optional()
                        .describe(
                            `Aerofly FS 4 code, ICAO code, (partial) name of aircraft or (partial) name of livery name available for aircraft. Call ${this.RESOURCE_AIRCRAFT} to see a list of all available ICAO or Aerofly FS4 codes.`,
                        ),
                    tags: z
                        .array(z.string().lowercase())
                        .optional()
                        .describe(
                            `Tags like 'airliner' or 'military'. If multiple tags are submitted, the will be linked via \`OR\`. all ${this.RESOURCE_AIRCRAFT_TAGS} to see a list of all available tags.`,
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
            }): CallToolResult => ({
                content: [
                    {
                        type: "text",
                        text: McpHelper.JSONstringify(
                            resourceService.searchAircraft({ query, tags, minimumRangeNm, minimumCruiseSpeedKts }),
                        ),
                    },
                ],
            }),
        );

        server.registerTool(
            ResourceRegistry.TOOL_SEARCH_AIRPORTS,
            {
                title: `Search Aerofly FS 4 airports`,
                description: `Search airports by ICAO code, (partial) name and/or geographical location. All search properties are linked by \`AND\`.`,
                inputSchema: {
                    query: z
                        .string()
                        .optional()
                        .describe(
                            `Airport ICAO code or (partial) name of airport. Will only find airports present in Aerofly FS 4.`,
                        ),
                    geoQuery: z.object({
                        longitude: ZodExtra.longitude().describe("Longitude of center point for geo search."),
                        latitude: ZodExtra.latitude().describe("Latitude of center point for geo search."),
                        radiusKm: z.number().positive().describe("Maximum distance in kilometers from center point."),
                    }),
                },
                annotations,
            },
            ({
                query,
                geoQuery,
            }: {
                query?: string;
                geoQuery?: { longitude: number; latitude: number; radiusKm: number };
            }): CallToolResult => ({
                content: [
                    {
                        type: "text",
                        text: McpHelper.JSONstringify(resourceService.searchAirports({ query, geoQuery })),
                    },
                ],
            }),
        );
    }
}
