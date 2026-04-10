import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AeroflyFlightMcpResourceService } from "../services/AeroflyFlightMcpResourceService.js";

type Variables = Record<string, string | string[]>;

export class ResourceServer {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static JSONstrinigify(value: any): string {
        return JSON.stringify(value, null, 2);
    }

    static registerResources(server: McpServer, resourceService: AeroflyFlightMcpResourceService) {
        server.registerResource(
            "aircraft",
            `${AeroflyFlightMcpResourceService.RESOURCE_NAME_SPACE}/aircraft`,
            {
                description: `A compressed list of all aircraft available in Aerofly FS 4. This provides the internal aeroflyCode for a given aircraft. There is also a resource providing detailed information for a given aeroflyCode.`,
                mimeType: AeroflyFlightMcpResourceService.MIME_TYPE_RESPONSE,
            },
            async (uri: URL) => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: AeroflyFlightMcpResourceService.MIME_TYPE_RESPONSE,
                        text: this.JSONstrinigify(resourceService.getAircraftList()),
                    },
                ],
            }),
        );

        server.registerResource(
            "aircraft-detail",
            new ResourceTemplate(`${AeroflyFlightMcpResourceService.RESOURCE_NAME_SPACE}/aircraft/{aeroflyCode}`, {
                list: async () => ({
                    resources: resourceService.getAircraftRessources(),
                }),
            }),
            {
                description: `Detailed information for a specific aircraft matching the Aerofly FS4 aircraft code given by \`aeroflyCode\` (string), if available in Aerofly FS 4. This gives you additional technical data like range and cruise speed, as well as a list of available liveries.`,
                mimeType: AeroflyFlightMcpResourceService.MIME_TYPE_RESPONSE,
            },
            async (uri: URL, { aeroflyCode }: Variables) => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: AeroflyFlightMcpResourceService.MIME_TYPE_RESPONSE,
                        text: this.JSONstrinigify(resourceService.getAircraft(String(aeroflyCode))),
                    },
                ],
            }),
        );

        server.registerResource(
            "aircraft-tags",
            `${AeroflyFlightMcpResourceService.RESOURCE_NAME_SPACE}/aircraft-tags`,
            {
                description: `A list of all tags which are attached to aircraft.`,
                mimeType: AeroflyFlightMcpResourceService.MIME_TYPE_RESPONSE,
            },
            async (uri: URL) => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: AeroflyFlightMcpResourceService.MIME_TYPE_RESPONSE,
                        text: this.JSONstrinigify(resourceService.getAircraftTags()),
                    },
                ],
            }),
        );

        server.registerResource(
            "airport",
            new ResourceTemplate(`${AeroflyFlightMcpResourceService.RESOURCE_NAME_SPACE}/airports/{icaoCode}`, {
                list: async () => ({
                    resources: resourceService.getAirportRessources(),
                }),
            }),
            {
                description: `Detailed information for a specific airport matching the ICAO code given by \`icaoCode\` (string), if available in Aerofly FS 4. This will give you the ICAO code, name, longitude and latitude of the airport. Be aware that the runways and parking positions available are not available in this MCP server and need to be fetched from online sources.`,
                mimeType: AeroflyFlightMcpResourceService.MIME_TYPE_RESPONSE,
            },
            async (uri: URL, { icaoCode }: Variables) => ({
                contents: [
                    {
                        uri: uri.href,
                        mimeType: AeroflyFlightMcpResourceService.MIME_TYPE_RESPONSE,
                        text: this.JSONstrinigify(resourceService.getAirport(String(icaoCode))),
                    },
                ],
            }),
        );
    }

    static registerTools(server: McpServer, resourceService: AeroflyFlightMcpResourceService) {
        server.registerTool(
            "search-aircraft",
            {
                title: `Search aircraft`,
                description: `Search aircraft by ICAO code, Aerofly code, tag, maximum range, maximum payload. All search properties are linked by \`AND\`.`,
                inputSchema: {
                    query: z
                        .string()
                        .optional()
                        .describe(
                            `Aerofly FS 4 code, ICAO code, (partial) name of aircraft or (partial) name of livery name available for aircraft. Call ${AeroflyFlightMcpResourceService.RESOURCE_NAME_SPACE}/aircraft to see a list of all available ICAO or Aerofly FS4 codes.`,
                        ),
                    tags: z
                        .array(z.string())
                        .optional()
                        .describe(
                            `Tags like 'airliner' or 'military'. If multiple tags are submitted, the will be linked via \`OR\`. all ${AeroflyFlightMcpResourceService.RESOURCE_NAME_SPACE}/aircraft-tags to see a list of all available tags.`,
                        ),
                    minimumRangeNm: z.number().optional().describe("Minimum range in nautical miles."),
                    minimumCruiseSpeedKts: z.number().optional().describe("Minimum cruise speed in knots."),
                },
            },
            async ({
                query,
                tags,
                minimumRangeNm,
                minimumCruiseSpeedKts,
            }: {
                query: string | undefined;
                tags: string[] | undefined;
                minimumRangeNm: number | undefined;
                minimumCruiseSpeedKts: number | undefined;
            }) => ({
                content: [
                    {
                        type: "text",
                        text: this.JSONstrinigify(
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
            },
            async ({ query }: { query: string | undefined }) => ({
                content: [
                    {
                        type: "text",
                        text: this.JSONstrinigify(resourceService.searchAirports({ query })),
                    },
                ],
            }),
        );
    }
}
