import { McpHelper } from "../util/McpHelper.js";
import { z } from "zod";
import { ResourceServer } from "../server/ResourceServer.js";
import { ZodExtra } from "../util/ZodExtra.js";
export class FlightServer {
    static METHOD_GET_FLIGHT = "get-aerofly-flight";
    static METHOD_SET_WEATHER = "set-weather";
    static METHOD_SET_CLOUDS = "set-clouds";
    static METHOD_SAVE_FLIGHT = "save-flight";
    static registerTools(server, flightService) {
        // Standard annotations for tool calls modifiy the flight planning (but not saving it to Aerofly FS 4)
        const annotations = {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        };
        server.registerTool(FlightServer.METHOD_GET_FLIGHT, {
            title: `Get status of flight planning`,
            description: `Will return the complete status of the flight planning, including selected aicraft and livery, selected payload and fuel mass, selected position and lfith settings, weather, time and waypoints. If no flight planning has yet happended, this will contain the state of \`main.mcf\`.`,
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: false,
                openWorldHint: false,
            },
        }, async () => ({
            content: [
                {
                    type: "text",
                    text: McpHelper.JSONstrinigify(flightService.getAeroflyFlight()),
                },
            ],
        }));
        server.registerTool("set-aircraft", {
            title: `Set aircraft for flight planning`,
            description: `Set aircraft as well as livery for flight planning. Call \`${ResourceServer.METHOD_SEARCH_AIRCRAFT}\` to search for the required Aerofly aircraft and livery codes. Returns the aircraft state afterwards.`,
            inputSchema: {
                aeroflyCodeAircraft: ZodExtra.aircraft().describe(`Aerofly aircraft code`),
                aeroflyCodeLivery: z
                    .string()
                    .lowercase()
                    .optional()
                    .describe(`Aerofly livery code. This code must exist for the given aircraft. Keep empty to set default livery.`),
            },
            annotations,
        }, async ({ aeroflyCodeAircraft, aeroflyCodeLivery, }) => ({
            content: [
                {
                    type: "text",
                    text: McpHelper.JSONstrinigify(flightService.setAircraft(aeroflyCodeAircraft, aeroflyCodeLivery ?? "")),
                },
            ],
        }));
        server.registerTool("set-fuel-and-payload", {
            title: `Set fuel and payload for flight planning`,
            description: `Set fuel and payload for flight planning. Call \`${ResourceServer.METHOD_SEARCH_AIRCRAFT}\` to search for the available maximum fuel ad payload mass. If given too much fuel and payload this will be capped automatically. Returns the fuel and payload state afterwards.`,
            inputSchema: {
                fuel: z
                    .number()
                    .nonnegative()
                    .optional()
                    .describe(`Fuel mass in kg. Must not exceed max fuel mass.`),
                payload: z
                    .number()
                    .nonnegative()
                    .optional()
                    .describe(`Payload mass in kg. Must not exceed max payload mass.`),
            },
            annotations,
        }, async ({ fuel, payload }) => ({
            content: [
                {
                    type: "text",
                    text: McpHelper.JSONstrinigify(flightService.setFuelAndPayload(fuel ?? 0, payload ?? 0)),
                },
            ],
        }));
        server.registerTool("set-date-and-time", {
            title: `Set date & time for flight planning`,
            description: `Set UTC date & time for flight planning. Returns the set time afterwards.`,
            inputSchema: {
                timeDate: z.iso.datetime({ offset: true }).describe(`ISO 8601 time & date including time zone.`),
            },
            annotations,
        }, async ({ timeDate }) => ({
            content: [
                {
                    type: "text",
                    text: McpHelper.JSONstrinigify(flightService.setTimeAndDate(timeDate)),
                },
            ],
        }));
        server.registerTool(FlightServer.METHOD_SET_WEATHER, {
            title: `Set weather for flight planning`,
            description: `Sets visibility, temperature and wind for the flight planning. Returns the weather conditions afterwards. Returns set weather afterwards. To set clouds call \`${FlightServer.METHOD_SET_CLOUDS}\`. Please note that there are no settings for rain, thunderstorms, snow etc.`,
            inputSchema: {
                visibilityM: z
                    .number()
                    .nonnegative()
                    .default(9999)
                    .describe(`Visibility in meters. Use 9999 for maximum visibility.`),
                temperatureCelsius: z
                    .number()
                    .default(14)
                    .describe(`Temperature in Celsius. Affects thermal activity.`),
                directionDegrees: ZodExtra.degree().describe(`Wind direction in degrees.`),
                speedKts: z.number().nonnegative().describe(`Wind speed in knots.`),
                gustsKts: z.number().nonnegative().optional().describe(`Gust speed in knots.`),
            },
            annotations,
        }, async ({ visibilityM, temperatureCelsius, directionDegrees, speedKts, gustsKts, }) => ({
            content: [
                {
                    type: "text",
                    text: McpHelper.JSONstrinigify(flightService.setWeather(visibilityM, temperatureCelsius, directionDegrees, speedKts, gustsKts)),
                },
            ],
        }));
        server.registerTool(FlightServer.METHOD_SET_CLOUDS, {
            title: `Set clouds for flight planning`,
            description: `Sets multiple clouds layers flight planning. Returns the cloud layers afterwards. Please note that Aerofly FS 4 only handles up to 3 cloud layers. Returns set clouds afterwards. To set other weather settings call \`${FlightServer.METHOD_SET_WEATHER}\`.`,
            inputSchema: {
                clouds: z
                    .array(z.object({
                    cloud_coverage: ZodExtra.normalized().describe("Coverage as a normalized value. 0 is clear, 1 ist completely overcast."),
                    base_feet_agl: z
                        .number()
                        .nonnegative()
                        .describe("Base height in feet above ground level."),
                }))
                    .describe(`List of cloud layers.`),
            },
            annotations,
        }, async ({ clouds, }) => ({
            content: [
                {
                    type: "text",
                    text: McpHelper.JSONstrinigify(flightService.setClouds(clouds)),
                },
            ],
        }));
        // Set flight settings
        // Set waypoints
        server.registerTool(FlightServer.METHOD_SAVE_FLIGHT, {
            title: `Save the flight planning to Aerofly FS 4`,
            description: `This will write all changes back to the \`main.mcf\`, which in turn makes the flight planning available in Aerofly FS 4. Returns the flight planning.`,
            annotations: {
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: false,
                openWorldHint: true,
            },
        }, async () => {
            flightService.writeFile();
            return {
                content: [
                    {
                        type: "text",
                        text: McpHelper.JSONstrinigify(flightService.getAeroflyFlight()),
                    },
                ],
            };
        });
    }
}
