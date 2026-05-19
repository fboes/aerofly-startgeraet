import { CallToolResult, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
export declare function JSONstringify<T>(value: T): string;
export declare function returnMcpToolSimpleResult<T>(data: T, warnings?: string[]): CallToolResult;
export declare function returnMcpToolResult<T>(data: T, warnings?: string[]): CallToolResult;
export declare function returnMcpToolErrorResult(messages: string[], code?: ErrorCode): CallToolResult;
//# sourceMappingURL=McpHelper.d.ts.map
