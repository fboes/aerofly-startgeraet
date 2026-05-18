import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
export declare const TOOL_GET_FLIGHT = "get-aerofly-flight";
export declare const TOOL_SET_AIRCRAFT = "set-aircraft-type-and-livery";
export declare const TOOL_SET_WEATHER = "set-weather";
export declare const TOOL_SET_CLOUDS = "set-clouds";
export declare const TOOL_SAVE_FLIGHT = "save-flight";
export declare const TOOL_SET_FUEL_PAYLOAD = "set-aircraft-fuel-and-payload";
export declare const TOOL_SET_DATE_TIME = "set-date-and-time";
export declare const TOOL_FETCH_METAR = "set-weather-via-api";
export declare const TOOL_FETCH_SIMBRIEF = "set-flightplan-via-simbrief";
export declare const TOOL_SET_POSITION = "set-aircraft-position-and-state";
export declare const TOOL_SET_WAYPOINTS = "set-flightplan-waypoints";
export declare function registerTools(server: McpServer, flightService: AeroflyFlightService): void;
export declare function registerPrompts(server: McpServer): void;
//# sourceMappingURL=FlightRegistry.d.ts.map
