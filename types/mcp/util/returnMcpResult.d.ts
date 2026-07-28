import { type CallToolResult, ProtocolErrorCode, type ReadResourceResult } from "@modelcontextprotocol/server";
export declare function returnMcpToolSimpleResult<T>(data: T, warnings?: string[]): CallToolResult;
export declare function returnMcpToolResult<T>(data: T, warnings?: string[]): CallToolResult;
export declare function returnMcpToolErrorResult(messages: string[], code?: ProtocolErrorCode): CallToolResult;
export declare function returnMcpResourceResult<T>(data: T, uri: URL, mimeType?: string): ReadResourceResult;
//# sourceMappingURL=returnMcpResult.d.ts.map