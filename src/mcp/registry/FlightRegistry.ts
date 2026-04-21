import fs from "node:fs";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpHelper } from "../util/McpHelper.js";
import { z } from "zod";
import {
    AeroflyFlightService,
    AeroflyFlightServiceAirport,
    AeroflyFlightServiceWaypoint,
    AeroflyFlightServiceRunway,
} from "../../core/services/AeroflyFlightService.js";
import { ResourceRegistry } from "../registry/ResourceRegistry.js";
import { ConfigurationRegistry } from "./ConfigurationRegistry.js";
import { ZodExtra } from "../util/ZodExtra.js";
import { CallToolResult, ToolAnnotations } from "@modelcontextprotocol/sdk/types";
import { SkyVectorService } from "../../core/data/SkyvectorUrl.js";

export class FlightRegistry {
    static readonly TOOL_GET_FLIGHT = "get-aerofly-flight";
    static readonly TOOL_SET_AIRCRAFT = "set-aircraft-type-and-livery";
    static readonly TOOL_SET_WEATHER = "set-weather";
    static readonly TOOL_SET_CLOUDS = "set-clouds";
    static readonly TOOL_SAVE_FLIGHT = "save-flight";
    static readonly TOOL_SET_FUEL_PAYLOAD = "set-aircraft-fuel-and-payload";
    static readonly TOOL_SET_DATE_TIME = "set-date-and-time";
    static readonly TOOL_FETCH_METAR = "set-weather-via-api";
    static readonly TOOL_FETCH_SIMBRIEF = "set-flightplan-via-simbrief";
    static readonly TOOL_SET_POSITION = "set-aircraft-position-and-state";
    static readonly TOOL_SET_WAYPOINTS = "set-flightplan-waypoints";

    static registerTools(server: McpServer, flightService: AeroflyFlightService): void {
        // Standard annotations for tool calls modifiy the flight mission setup (but not saving it to Aerofly FS 4)
        const annotations: ToolAnnotations = {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        };

        server.registerTool(
            FlightRegistry.TOOL_GET_FLIGHT,
            {
                title: `Get complete status of flight mission setup`,
                description: `Includes selected aicraft and livery, selected payload and fuel mass, selected aircraft position and settings, weather, time and flight plan waypoints. If no flight mission setup has yet happended, this will contain the state of \`main.mcf\`.`,
                annotations: {
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: false,
                },
            },
            (): CallToolResult => ({
                content: [
                    {
                        type: "text",
                        text: McpHelper.JSONstringify(flightService.getAeroflyFlight()),
                    },
                ],
            }),
        );

        server.registerTool(
            FlightRegistry.TOOL_SET_AIRCRAFT,
            {
                title: `Set aircraft type & livery for flight mission setup`,
                description: `Call \`${ResourceRegistry.TOOL_SEARCH_AIRCRAFT}\` to search for the required Aerofly aircraft and livery codes. Returns the aircraft state afterwards.`,
                inputSchema: {
                    aeroflyCodeAircraft: ZodExtra.aircraft().describe(`Aerofly aircraft code`),
                    aeroflyCodeLivery: z
                        .string()
                        .lowercase()
                        .optional()
                        .describe(
                            `Aerofly livery code. This code must exist for the given aircraft. Keep empty to set default livery.`,
                        ),
                },
                annotations,
            },
            ({
                aeroflyCodeAircraft,
                aeroflyCodeLivery,
            }: {
                aeroflyCodeAircraft: string;
                aeroflyCodeLivery?: string;
            }): CallToolResult => {
                const result = flightService.setAircraft(aeroflyCodeAircraft, aeroflyCodeLivery ?? "");
                const warnings =
                    flightService.getAircraftData() !== undefined
                        ? []
                        : [
                              `The aircraft ${aeroflyCodeAircraft} with livery ${aeroflyCodeLivery ?? "default"} does not exist in the current Aerofly FS 4 installation. Please check the available aircraft via ${ResourceRegistry.RESOURCE_AIRCRAFT} and the available liveries for the given aircraft.`,
                          ];
                return McpHelper.returnResultContent(result, warnings);
            },
        );

        server.registerTool(
            FlightRegistry.TOOL_SET_FUEL_PAYLOAD,
            {
                title: `Set aircraft fuel and payload for flight mission setup`,
                description: `Call \`${ResourceRegistry.TOOL_SEARCH_AIRCRAFT}\` to search for the available maximum fuel ad payload mass. If given too much fuel and payload this will be capped automatically. Returns the fuel and payload state afterwards.`,
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
            },
            ({ fuel, payload }: { fuel?: number; payload?: number }): CallToolResult => {
                const result = flightService.setFuelAndPayload(fuel ?? 0, payload ?? 0);

                const warnings = [];
                if (fuel && fuel !== result.fuelMass) {
                    warnings.push(
                        `The requested fuel mass (${fuel.toString()} kg) exceeds the maximum allowed (${result.fuelMass.toString()} kg). Fuel mass has been capped.`,
                    );
                }
                if (payload && payload !== result.payloadMass) {
                    warnings.push(
                        `The requested payload mass (${payload.toString()} kg) exceeds the maximum remaining (${result.payloadMass.toString()} kg). Payload mass has been capped.`,
                    );
                }
                return McpHelper.returnResultContent(result, warnings);
            },
        );

        server.registerTool(
            FlightRegistry.TOOL_SET_DATE_TIME,
            {
                title: `Set date & time for flight mission setup`,
                description: `Returns the set time afterwards.`,
                inputSchema: {
                    timeDate: z.iso.datetime({ offset: true }).describe(`ISO 8601 date & time including time zone.`),
                },
                annotations,
            },
            ({ timeDate }: { timeDate: string }): CallToolResult =>
                McpHelper.returnResultContent(flightService.setTimeAndDate(timeDate)),
        );

        server.registerTool(
            FlightRegistry.TOOL_SET_WEATHER,
            {
                title: `Set visibility, temperature and wind for flight mission setup`,
                description: `Returns the weather conditions afterwards. Returns set weather afterwards. To set clouds call \`${FlightRegistry.TOOL_SET_CLOUDS}\`. Please note that there are no settings for rain, thunderstorms, snow etc.`,
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
            },
            ({
                visibilityM,
                temperatureCelsius,
                directionDegrees,
                speedKts,
                gustsKts,
            }: {
                visibilityM: number;
                temperatureCelsius: number;
                directionDegrees: number;
                speedKts: number;
                gustsKts?: number;
            }): CallToolResult =>
                McpHelper.returnResultContent(
                    flightService.setWeather(visibilityM, temperatureCelsius, directionDegrees, speedKts, gustsKts),
                ),
        );

        server.registerTool(
            FlightRegistry.TOOL_SET_CLOUDS,
            {
                title: `Set cloud layers for flight mission setup`,
                description: `Please note that Aerofly FS 4 only handles up to 3 cloud layers. Returns set clouds afterwards. To set other weather settings call \`${FlightRegistry.TOOL_SET_WEATHER}\`.`,
                inputSchema: {
                    clouds: z
                        .array(
                            z.object({
                                cloud_coverage: ZodExtra.normalized().describe(
                                    "Coverage as a normalized value. 0 is clear, 1 ist completely overcast.",
                                ),
                                base_feet_agl: z
                                    .number()
                                    .nonnegative()
                                    .describe("Base height in feet above ground level."),
                            }),
                        )
                        .describe(`List of cloud layers.`),
                },
                annotations,
            },
            ({
                clouds,
            }: {
                clouds: {
                    cloud_coverage: number;
                    base_feet_agl: number;
                }[];
            }): CallToolResult => {
                const result = flightService.setClouds(clouds);
                const warnings =
                    result.length > 3
                        ? [
                              `Aerofly FS 4 only supports three layers of clouds. Surplus cloud layers will be ignored. You may want to remove clouds layers closer together or with lighter coverage.`,
                          ]
                        : [];
                return McpHelper.returnResultContent(result, warnings);
            },
        );

        server.registerTool(
            FlightRegistry.TOOL_FETCH_METAR,
            {
                title: `Replace weather in flight mission setup with weather / METAR data fetched via API`,
                description: `Will call the Aviation Weather METAR API. Will use the time & date set in flight plan. This day must not be more than two weeks in the past and cannot be in the future. Returns the weather data.`,
                inputSchema: {
                    airportIcaoCode: ZodExtra.identifier().describe(
                        `ICAO code of airport for which to fetch weather / METAR data.`,
                    ),
                },
                annotations: {
                    ...annotations,
                    openWorldHint: true,
                },
            },
            async ({ airportIcaoCode }: { airportIcaoCode: string }): Promise<CallToolResult> => {
                try {
                    return McpHelper.returnResultContent(await flightService.setWeatherViaApi(airportIcaoCode));
                } catch (e) {
                    return McpHelper.returnErrorContent([
                        `The METAR rport for this combination of ICAO code and date is missing. Valid dates are up to two weeks in the past.`,
                        e instanceof Error ? e.message : String(e),
                    ]);
                }
            },
        );

        server.registerTool(
            FlightRegistry.TOOL_FETCH_SIMBRIEF,
            {
                title: `Replace complete flight mission setup with SimBrief flight plan fetched via API`,
                description: `Will use the SimBrief API to fetch the latest flight plan for the given SimBrief user, including weather and aircraft type. Should only be called if user explicitly requests SimBrief import. Returns the flight mission setup. The SimBrief username can be stored by calling ${ConfigurationRegistry.TOOL_SET_CONFIG}, and (if stored) can be read by calling ${ConfigurationRegistry.TOOL_GET_CONFIG}.`,
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
            },
            async ({ simBriefUserName }: { simBriefUserName: string }): Promise<CallToolResult> => {
                try {
                    await flightService.importFlightplanFromSimBrief(simBriefUserName);
                } catch (e) {
                    return McpHelper.returnErrorContent([
                        `The API did not respond with an flight plan. Possibly the user name is unknown, or there is no current flight plan.`,
                        e instanceof Error ? e.message : String(e),
                    ]);
                }

                return McpHelper.returnResultContent(flightService.getAeroflyFlight());
            },
        );

        server.registerTool(
            FlightRegistry.TOOL_SET_POSITION,
            {
                title: `Set initial aircraft position & state for flight mission setup`,
                description: `Assumes at a speed of 0 kts the aircraft to be positioned on the ground. Returns the initial aircraft position & state.`,
                inputSchema: {
                    longitude: ZodExtra.longitude(),
                    latitude: ZodExtra.latitude(),
                    altitude_meter: z.number(),
                    heading_degree: ZodExtra.degree(),
                    speed_kts: z.number().nonnegative(),
                },
                annotations,
            },
            ({
                longitude,
                latitude,
                altitude_meter,
                heading_degree,
                speed_kts,
            }: {
                longitude: number;
                latitude: number;
                altitude_meter: number;
                heading_degree: number;
                speed_kts: number;
            }): CallToolResult => {
                return McpHelper.returnResultContent(
                    flightService.setFlightPosition(longitude, latitude, altitude_meter, heading_degree, speed_kts),
                );
            },
        );

        server.registerTool(
            FlightRegistry.TOOL_SET_WAYPOINTS,
            {
                title: `Set flight plan waypoints for flight mission setup`,
                description: `Returns the set waypoints afterwards. Please note that currently only the position and altitude of waypoints can be set, but no other settings like flyover or approach. After setting the flight plan, the aircraft is also moved to the origin airport.`,
                inputSchema: {
                    origin: ZodExtra.airport().describe(`Origin airport with ICAO code`),
                    departureRunway: ZodExtra.runway()
                        .optional()
                        .describe(
                            `Departure runway at origin airport with runway name.Position will be inferred from airport coordinates, length and identifier / direction.`,
                        ),
                    destination: ZodExtra.airport().describe(`Destination airport with ICAO code`),
                    destinationRunway: ZodExtra.runway()
                        .optional()
                        .describe(
                            `Destination runway at destination airport with runway name. Position will be inferred from airport coordinates, length and identifier / direction.`,
                        ),
                    waypoints: z
                        .array(ZodExtra.waypoint())
                        .optional()
                        .describe(`List of waypoints between origin and destination.`),
                    cruiseAltitudeFt: z
                        .number()
                        .optional()
                        .describe(
                            `Cruise altitude in feet. This is not a setting of the flight plan, but can be used to set the altitude of waypoints without altitude information.`,
                        ),
                },
                annotations,
            },
            ({
                origin,
                departureRunway,
                destination,
                destinationRunway,
                waypoints,
                cruiseAltitudeFt,
            }: {
                origin: AeroflyFlightServiceAirport;
                departureRunway: AeroflyFlightServiceRunway | undefined;
                destination: AeroflyFlightServiceAirport;
                destinationRunway: AeroflyFlightServiceRunway | undefined;
                waypoints: AeroflyFlightServiceWaypoint[] | undefined;
                cruiseAltitudeFt: number | undefined;
            }): CallToolResult => {
                const result = flightService.setFlightplan(origin, destination, {
                    departureRunway,
                    destinationRunway,
                    waypoints,
                    cruiseAltitudeFt,
                });
                flightService.setFlightPositionToDeparture();
                return McpHelper.returnResultContent(result, ["Aircraft has been re-positioned to origin airport"]);
            },
        );

        server.registerTool(
            FlightRegistry.TOOL_SAVE_FLIGHT,
            {
                title: `Save the flight mission setup to Aerofly FS 4`,
                description: `This will write all changes back to the \`main.mcf\`, which in turn makes the flight mission setup available in Aerofly FS 4. Returns the flight mission setup. Without calling this tool, no changes will be available in Aerofly FS 4.`,
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: true,
                    idempotentHint: false,
                    openWorldHint: true,
                },
            },
            (): CallToolResult => {
                try {
                    flightService.writeFile();
                } catch (e) {
                    return McpHelper.returnErrorContent([
                        `You might want to check the configuration of the MCP server. To change the configuration, call \`${ConfigurationRegistry.TOOL_SET_CONFIG}\`.`,
                        e instanceof Error ? e.message : String(e),
                    ]);
                }

                return McpHelper.returnResultContent(flightService.getAeroflyFlight());
            },
        );

        server.registerTool(
            "get-skyvector-url",
            {
                title: `Get URL for the Skyvector flight planning service`,
                description: `This will prove an URL which shows the current flight plan on the flight planning service SkyVector if opened in a browser.`,
                annotations: {
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: false,
                },
            },
            (): CallToolResult => {
                return McpHelper.returnResultContent(
                    new SkyVectorService(
                        flightService.getAeroflyFlight(),
                        flightService.getAircraftData()?.cruiseSpeedKts ?? 0,
                    ).toString(),
                );
            },
        );
    }

    static registerPrompts(server: McpServer) {
        server.registerPrompt(
            "aerofly-mission",
            {
                title: "Create Aerofly Flight Plan",
                description:
                    "Prepare a complete flight plan for Aerofly FS 4, including aircraft, route, weather and time settings.",
            },
            () => ({
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: fs.readFileSync(
                                path.join(import.meta.dirname, "../../..", "docs/mcp", "prompt-aerofly-mission.md"),
                                "utf-8",
                            ),
                        },
                    },
                ],
            }),
        );

        server.registerPrompt(
            "aerofly-mission-import",
            {
                title: "Import Aerofly Flight Plan from SimBrief",
                description:
                    "Prepare a complete flight plan for Aerofly FS 4 by importing almost all data from a SimBrief flight plan.",
            },
            () => ({
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: fs.readFileSync(
                                path.join(
                                    import.meta.dirname,
                                    "../../..",
                                    "docs/mcp",
                                    "prompt-aerofly-mission-import.md",
                                ),
                                "utf-8",
                            ),
                        },
                    },
                ],
            }),
        );
    }
}
