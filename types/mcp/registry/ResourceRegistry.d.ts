import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AeroflyFlightMcpResourceService } from "../services/AeroflyFlightMcpResourceService.js";
export declare class ResourceRegistry {
    static readonly MIME_TYPE_RESPONSE = "application/json";
    static readonly RESOURCE_NAME_SPACE = "resource://aerofly";
    static readonly RESOURCE_AIRCRAFT: string;
    static readonly RESOURCE_AIRCRAFT_TAGS: string;
    static readonly RESOURCE_AIRPORTS: string;
    static readonly TOOL_SEARCH_AIRCRAFT = "search-aicraft";
    static readonly TOOL_SEARCH_AIRPORTS = "search-airports";
    static registerResources(server: McpServer, resourceService: AeroflyFlightMcpResourceService): void;
    static registerTools(server: McpServer, resourceService: AeroflyFlightMcpResourceService): void;
}
//# sourceMappingURL=ResourceRegistry.d.ts.map
