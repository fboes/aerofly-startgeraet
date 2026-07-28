import { ProtocolErrorCode, } from "@modelcontextprotocol/server";
/**
 * Ready-to-use result objects for MCP tool and resource repsonses
 */
function JSONstringify(value) {
    return JSON.stringify(value, null, 2);
}
export function returnMcpToolSimpleResult(data, warnings = []) {
    return {
        content: [
            {
                type: "text",
                text: JSONstringify(data),
            },
            ...warnings.map((text) => ({
                type: "text",
                text: "Warning: " + text,
            })),
        ],
    };
}
export function returnMcpToolResult(data, warnings = []) {
    return returnMcpToolSimpleResult({ data }, warnings);
}
export function returnMcpToolErrorResult(messages, code = ProtocolErrorCode.InvalidRequest) {
    {
        return {
            content: messages.map((message) => ({
                type: "text",
                text: JSON.stringify({
                    error: {
                        code,
                        message,
                    },
                }),
            })),
            isError: true,
        };
    }
}
export function returnMcpResourceResult(data, uri, mimeType = "application/json") {
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
