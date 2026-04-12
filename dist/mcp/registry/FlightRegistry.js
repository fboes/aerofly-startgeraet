import { McpHelper } from "../util/McpHelper.js";
import { z } from "zod";
import { ResourceRegistry } from "../registry/ResourceRegistry.js";
import { ConfigurationRegistry } from "./ConfigurationRegistry.js";
import { ZodExtra } from "../util/ZodExtra.js";
export class FlightRegistry {
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
        server.registerTool(FlightRegistry.METHOD_GET_FLIGHT, {
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
            description: `Set aircraft as well as livery for flight planning. Call \`${ResourceRegistry.METHOD_SEARCH_AIRCRAFT}\` to search for the required Aerofly aircraft and livery codes. Returns the aircraft state afterwards.`,
            inputSchema: {
                aeroflyCodeAircraft: ZodExtra.aircraft().describe(`Aerofly aircraft code`),
                aeroflyCodeLivery: z
                    .string()
                    .lowercase()
                    .optional()
                    .describe(`Aerofly livery code. This code must exist for the given aircraft. Keep empty to set default livery.`),
            },
            annotations,
        }, async ({ aeroflyCodeAircraft, aeroflyCodeLivery, }) => {
            const result = flightService.setAircraft(aeroflyCodeAircraft, aeroflyCodeLivery ?? "");
            const warnings = flightService.getAircraftData() !== undefined
                ? []
                : [
                    `The aircraft ${aeroflyCodeAircraft} with livery ${aeroflyCodeLivery} does not exist in the current Aerofly FS 4 installation. Please check the available aircraft via ${ResourceRegistry.URL_AIRCRAFT} and the available liveries for the given aircraft.`,
                ];
            return McpHelper.returnResultContent(result, warnings);
        });
        server.registerTool("set-fuel-and-payload", {
            title: `Set fuel and payload for flight planning`,
            description: `Set fuel and payload for flight planning. Call \`${ResourceRegistry.METHOD_SEARCH_AIRCRAFT}\` to search for the available maximum fuel ad payload mass. If given too much fuel and payload this will be capped automatically. Returns the fuel and payload state afterwards.`,
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
        }, async ({ fuel, payload }) => {
            const result = flightService.setFuelAndPayload(fuel ?? 0, payload ?? 0);
            const warnings = [];
            if (fuel !== result.fuelMass) {
                warnings.push(`The requested fuel mass (${fuel} kg) exceeds the maximum allowed (${result.fuelMass} kg). Fuel mass has been capped.`);
            }
            if (payload !== result.payloadMass) {
                warnings.push(`The requested payload mass (${payload} kg) exceeds the maximum remaining (${result.payloadMass} kg). Payload mass has been capped.`);
            }
            return McpHelper.returnResultContent(result, warnings);
        });
        server.registerTool("set-date-and-time", {
            title: `Set date & time for flight planning`,
            description: `Set UTC date & time for flight planning. Returns the set time afterwards.`,
            inputSchema: {
                timeDate: z.iso.datetime({ offset: true }).describe(`ISO 8601 time & date including time zone.`),
            },
            annotations,
        }, async ({ timeDate }) => McpHelper.returnResultContent(flightService.setTimeAndDate(timeDate)));
        server.registerTool(FlightRegistry.METHOD_SET_WEATHER, {
            title: `Set weather for flight planning`,
            description: `Sets visibility, temperature and wind for the flight planning. Returns the weather conditions afterwards. Returns set weather afterwards. To set clouds call \`${FlightRegistry.METHOD_SET_CLOUDS}\`. Please note that there are no settings for rain, thunderstorms, snow etc.`,
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
        }, async ({ visibilityM, temperatureCelsius, directionDegrees, speedKts, gustsKts, }) => McpHelper.returnResultContent(flightService.setWeather(visibilityM, temperatureCelsius, directionDegrees, speedKts, gustsKts)));
        server.registerTool(FlightRegistry.METHOD_SET_CLOUDS, {
            title: `Set clouds for flight planning`,
            description: `Sets multiple clouds layers flight planning. Returns the cloud layers afterwards. Please note that Aerofly FS 4 only handles up to 3 cloud layers. Returns set clouds afterwards. To set other weather settings call \`${FlightRegistry.METHOD_SET_WEATHER}\`.`,
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
        }, async ({ clouds, }) => {
            const result = flightService.setClouds(clouds);
            const warnings = result.length > 3
                ? [
                    `Aerofly FS 4 only supports three layers of clouds. Surplus cloud layers will be ignored. You may want to remove clouds layers closer together or with lighter coverage.`,
                ]
                : [];
            return McpHelper.returnResultContent(result, warnings);
        });
        server.registerTool("set-weather-via-api", {
            title: `Replace weather in flight planning with weather / METAR data fetched via API`,
            description: `Sets the complete weather data to flight plan by calling the Aviation Weather METAR API. Will use the time & date set in flight plan. This day must not be more than two weeks in the past and cannot be in the future. Returns the weather data.`,
            inputSchema: {
                airportIcaoCode: ZodExtra.identifier().describe(`ICAO code of airport for which to fetch weather / METAR data.`),
            },
            annotations: {
                ...annotations,
                openWorldHint: true,
            },
        }, async ({ airportIcaoCode }) => {
            try {
                return McpHelper.returnResultContent(await flightService.setWeatherViaApi(airportIcaoCode));
            }
            catch (e) {
                return McpHelper.returnResultContent(e, [
                    `The METAR rport for this combination of ICAO code and date is missing. Valid dates are up to two weeks in the past.`,
                ], false);
            }
        });
        server.registerTool("set-flightplan-via-simbrief", {
            title: `Replace flight planning with SimBrief flight plan fetched via API`,
            description: `Will use the SimBrief API to fetch the latest flight plan for the given SimBrief user, including aircraft, weather and actual flight plan. Can only be called if user explicitly requests SimBrief import. Returns the flight planning. The SimBrief username can be stored by calling ${ConfigurationRegistry.METHOD_SET_CONFIG}, and (if stored) can be read by calling ${ConfigurationRegistry.METHOD_GET_CONFIG}.`,
            inputSchema: {
                simBriefUserName: z
                    .string()
                    .regex(/^[a-zA-Z0-9_]+$/)
                    .describe(`SimBrief username or user id.`),
            },
            annotations: {
                ...annotations,
                openWorldHint: true,
            },
        }, async ({ simBriefUserName }) => {
            try {
                await flightService.importFlightplanFromSimBrief(simBriefUserName);
            }
            catch (e) {
                return McpHelper.returnResultContent(e, [
                    `The API did not respond with an flight plan. Possibly the user name is unknown, or there is no current flight plan`,
                ], false);
            }
            return McpHelper.returnResultContent(flightService.getAeroflyFlight());
        });
        // Set flight settings
        // Set waypoints
        server.registerTool(FlightRegistry.METHOD_SAVE_FLIGHT, {
            title: `Save the flight planning to Aerofly FS 4`,
            description: `This will write all changes back to the \`main.mcf\`, which in turn makes the flight planning available in Aerofly FS 4. Returns the flight planning.`,
            annotations: {
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: false,
                openWorldHint: true,
            },
        }, async () => {
            try {
                flightService.writeFile();
            }
            catch (e) {
                return McpHelper.returnResultContent(e, [
                    `You might want to check the configuration of the MCP server. To change the configuration, call \`${ConfigurationRegistry.METHOD_SET_CONFIG}\`.`,
                ], false);
            }
            return McpHelper.returnResultContent(flightService.getAeroflyFlight());
        });
    }
}
