import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
export declare class FlightRegistry {
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
    static registerTools(server: McpServer, flightService: AeroflyFlightService): void;
}
//# sourceMappingURL=FlightRegistry.d.ts.map
