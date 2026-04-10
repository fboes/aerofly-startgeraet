import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AeroflyFlightMcpResourceService } from "../services/AeroflyFlightMcpResourceService.js";
export declare class ResourceServer {
    static readonly MIME_TYPE_RESPONSE = "application/json";
    static readonly URL_NAME_SPACE = "resource://aerofly";
    static readonly URL_AIRCRAFT: string;
    static readonly URL_AIRCRAFT_TAGS: string;
    static readonly URL_AIRPORTS: string;
    static registerResources(server: McpServer, resourceService: AeroflyFlightMcpResourceService): void;
    static registerTools(server: McpServer, resourceService: AeroflyFlightMcpResourceService): void;
}
//# sourceMappingURL=ResourceServer.d.ts.map
