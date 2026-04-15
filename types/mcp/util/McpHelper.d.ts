import { CallToolResult, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
export declare class McpHelper {
    static JSONstringify<T>(value: T): string;
    static returnResultContent<T>(data: T, warnings?: string[]): CallToolResult;
    static returnErrorContent(messages: string[], code?: ErrorCode): CallToolResult;
}
//# sourceMappingURL=McpHelper.d.ts.map
