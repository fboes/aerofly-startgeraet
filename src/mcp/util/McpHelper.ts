import { CallToolResult, TextContent, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export function JSONstringify<T>(value: T): string {
    return JSON.stringify(value, null, 2);
}

export function returnMcpToolSimpleResult<T>(data: T, warnings: string[] = []): CallToolResult {
    return {
        content: [
            {
                type: "text",
                text: JSONstringify(data),
            },
            ...warnings.map(
                (text): TextContent => ({
                    type: "text",
                    text: "Warning: " + text,
                }),
            ),
        ],
    };
}

export function returnMcpToolResult<T>(data: T, warnings: string[] = []): CallToolResult {
    return returnMcpToolSimpleResult({ data }, warnings);
}

export function returnMcpToolErrorResult(
    messages: string[],
    code: ErrorCode = ErrorCode.InvalidRequest,
): CallToolResult {
    {
        return {
            content: messages.map(
                (message): TextContent => ({
                    type: "text",
                    text: JSON.stringify({
                        error: {
                            code,
                            message,
                        },
                    }),
                }),
            ),
            isError: true,
        };
    }
}
