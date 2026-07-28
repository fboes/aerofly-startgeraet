import {
    type CallToolResult,
    type TextContent,
    ProtocolErrorCode,
    type ReadResourceResult,
} from "@modelcontextprotocol/server";

/**
 * Ready-to-use result objects for MCP tool and resource repsonses
 */

function JSONstringify<T>(value: T): string {
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
    code: ProtocolErrorCode = ProtocolErrorCode.InvalidRequest,
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

export function returnMcpResourceResult<T>(data: T, uri: URL, mimeType = "application/json"): ReadResourceResult {
    return {
        contents: [
            {
                uri: uri.href,
                mimeType,
                text: JSONstringify(data),
            },
        ],
    };
}
