import { CallToolResult, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
export declare function JSONstringify<T>(value: T): string;
export declare function returnSimplifiedResultContent<T>(data: T): CallToolResult;
export declare function returnResultContent<T>(data: T, warnings?: string[]): CallToolResult;
export declare function returnErrorContent(messages: string[], code?: ErrorCode): CallToolResult;
//# sourceMappingURL=McpHelper.d.ts.map
