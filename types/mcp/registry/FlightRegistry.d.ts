import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
export declare class FlightRegistry {
    static readonly METHOD_GET_FLIGHT = "get-aerofly-flight";
    static readonly METHOD_SET_WEATHER = "set-weather";
    static readonly METHOD_SET_CLOUDS = "set-clouds";
    static readonly METHOD_SAVE_FLIGHT = "save-flight";
    static registerTools(server: McpServer, flightService: AeroflyFlightService): void;
}
//# sourceMappingURL=FlightRegistry.d.ts.map
