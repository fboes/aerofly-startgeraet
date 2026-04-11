import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AeroflyFlightMcpResourceService } from "../services/AeroflyFlightMcpResourceService.js";
import { McpHelper } from "../util/McpHelper.js";

type Variables = Record<string, string | string[]>;

export class ResourceServer {
    static readonly MIME_TYPE_RESPONSE = "application/json";
    static readonly URL_NAME_SPACE = "resource://aerofly";
    static readonly URL_AIRCRAFT = `${this.URL_NAME_SPACE}/aircraft`;
    static readonly URL_AIRCRAFT_TAGS = `${this.URL_NAME_SPACE}/aircraft-tags`;
    static readonly URL_AIRPORTS = `${this.URL_NAME_SPACE}/airports`;
    static readonly METHOD_SEARCH_AIRCRAFT = "search-aicraft";

    static registerResources(server: McpServer, resourceService: AeroflyFlightMcpResourceService) {
        server.registerResource(
            "aircraft",
            this.URL_AIRCRAFT,
            {
                description: `A compressed list of all aircraft available in Aerofly FS 4. This provides the internal aeroflyCode for a given aircraft. There is also a resource providing detailed information for a given aeroflyCode.`,
                mimeType: this.MIME_TYPE_RESPONSE,
            },
            async (uri: URL) => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: this.MIME_TYPE_RESPONSE,
                        text: McpHelper.JSONstrinigify(resourceService.getAircraftList()),
                    },
                ],
            }),
        );

        server.registerResource(
            "aircraft-detail",
            new ResourceTemplate(`${this.URL_AIRCRAFT}/{aeroflyCode}`, {
                list: async () => ({
                    resources: resourceService.getAircraftRessources(),
                }),
            }),
            {
                description: `Detailed information for a specific aircraft matching the Aerofly FS4 aircraft code given by \`aeroflyCode\` (string), if available in Aerofly FS 4. This gives you additional technical data like range and cruise speed, as well as a list of available liveries.`,
                mimeType: this.MIME_TYPE_RESPONSE,
            },
            async (uri: URL, { aeroflyCode }: Variables) => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: this.MIME_TYPE_RESPONSE,
                        text: McpHelper.JSONstrinigify(resourceService.getAircraft(String(aeroflyCode))),
                    },
                ],
            }),
        );

        server.registerResource(
            "aircraft-tags",
            this.URL_AIRCRAFT_TAGS,
            {
                description: `A list of all tags which are attached to aircraft.`,
                mimeType: this.MIME_TYPE_RESPONSE,
            },
            async (uri: URL) => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: this.MIME_TYPE_RESPONSE,
                        text: McpHelper.JSONstrinigify(resourceService.getAircraftTags()),
                    },
                ],
            }),
        );

        server.registerResource(
            "airport",
            new ResourceTemplate(`${this.URL_AIRPORTS}/{icaoCode}`, {
                list: async () => ({
                    resources: resourceService.getAirportRessources(),
                }),
            }),
            {
                description: `Detailed information for a specific airport matching the ICAO code given by \`icaoCode\` (string), if available in Aerofly FS 4. This will give you the ICAO code, name, longitude and latitude of the airport. Be aware that the runways and parking positions available are not available in this MCP server and need to be fetched from online sources.`,
                mimeType: this.MIME_TYPE_RESPONSE,
            },
            async (uri: URL, { icaoCode }: Variables) => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: this.MIME_TYPE_RESPONSE,
                        text: McpHelper.JSONstrinigify(resourceService.getAirport(String(icaoCode))),
                    },
                ],
            }),
        );
    }

    static registerTools(server: McpServer, resourceService: AeroflyFlightMcpResourceService) {
        const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false };
        server.registerTool(
            this.METHOD_SEARCH_AIRCRAFT,
            {
                title: `Search aircraft`,
                description: `Search aircraft by ICAO code, Aerofly code, tag, maximum range, maximum payload. All search properties are linked by \`AND\`.`,
                inputSchema: {
                    query: z
                        .string()
                        .optional()
                        .describe(
                            `Aerofly FS 4 code, ICAO code, (partial) name of aircraft or (partial) name of livery name available for aircraft. Call ${this.URL_AIRCRAFT} to see a list of all available ICAO or Aerofly FS4 codes.`,
                        ),
                    tags: z
                        .array(z.string().lowercase())
                        .optional()
                        .describe(
                            `Tags like 'airliner' or 'military'. If multiple tags are submitted, the will be linked via \`OR\`. all ${this.URL_AIRCRAFT_TAGS} to see a list of all available tags.`,
                        ),
                    minimumRangeNm: z.number().positive().optional().describe("Minimum range in nautical miles."),
                    minimumCruiseSpeedKts: z.number().positive().optional().describe("Minimum cruise speed in knots."),
                },
                annotations,
            },
            async ({
                query,
                tags,
                minimumRangeNm,
                minimumCruiseSpeedKts,
            }: {
                query?: string;
                tags?: string[];
                minimumRangeNm?: number;
                minimumCruiseSpeedKts?: number;
            }) => ({
                content: [
                    {
                        type: "text",
                        text: McpHelper.JSONstrinigify(
                            resourceService.searchAircraft({ query, tags, minimumRangeNm, minimumCruiseSpeedKts }),
                        ),
                    },
                ],
            }),
        );

        server.registerTool(
            "search-airports",
            {
                title: `Search airports`,
                description: `Search airports by ICAO code or (partial) name. All search properties are linked by \`AND\`.`,
                inputSchema: {
                    query: z
                        .string()
                        .optional()
                        .describe(
                            `Airport ICAO code or (partial) name of airport. Will only find airports present in Aerofly FS 4.`,
                        ),
                },
                annotations,
            },
            async ({ query }: { query?: string }) => ({
                content: [
                    {
                        type: "text",
                        text: McpHelper.JSONstrinigify(resourceService.searchAirports({ query })),
                    },
                ],
            }),
        );
    }
}
