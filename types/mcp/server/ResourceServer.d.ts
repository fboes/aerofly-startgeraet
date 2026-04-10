import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AeroflyFlightMcpResourceService } from "../services/AeroflyFlightMcpResourceService.js";
export declare class ResourceServer {
    static JSONstrinigify(value: any): string;
    static registerResources(server: McpServer, resourceService: AeroflyFlightMcpResourceService): void;
    static registerTools(server: McpServer, resourceService: AeroflyFlightMcpResourceService): void;
}
//# sourceMappingURL=ResourceServer.d.ts.map
