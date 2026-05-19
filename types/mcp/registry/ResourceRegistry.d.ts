import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AeroflyFlightMcpResourceService } from "../services/AeroflyFlightMcpResourceService.js";
export declare const RESOURCE_AIRCRAFT = "resource://aerofly/aircraft";
export declare const RESOURCE_AIRCRAFT_TAGS = "resource://aerofly/aircraft-tags";
export declare const RESOURCE_AIRPORTS = "resource://aerofly/airports";
export declare const RESOURCE_RULES = "resource://aerofly/general-rules";
export declare const TOOL_SEARCH_AIRCRAFT = "search-aicraft";
export declare const TOOL_SEARCH_AIRPORTS = "search-airports";
export declare const TOOL_SEARCH_NAVAIDS = "search-navaids";
export declare const TOOL_SEARCH_FIX = "search-waypoint-fix";
export declare const TOOL_GET_AIRPORT_DETAILS = "get-airport-details";
export declare const TOOL_GET_ELEVATION = "get-elevation";
export declare function registerResources(server: McpServer, resourceService: AeroflyFlightMcpResourceService): void;
export declare function registerTools(server: McpServer, resourceService: AeroflyFlightMcpResourceService): void;
//# sourceMappingURL=ResourceRegistry.d.ts.map