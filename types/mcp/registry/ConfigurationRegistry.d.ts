import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Config } from "../../core/io/Config.js";
export declare class ConfigurationRegistry {
    static readonly METHOD_GET_CONFIG = "get-config";
    static readonly METHOD_SET_CONFIG = "set-config";
    static registerTools(server: McpServer, config: Config): void;
}
//# sourceMappingURL=ConfigurationRegistry.d.ts.map
