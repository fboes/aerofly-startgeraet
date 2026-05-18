import { ErrorCode } from "@modelcontextprotocol/sdk/types.js";
export function JSONstringify(value) {
    return JSON.stringify(value, null, 2);
}
export function returnSimplifiedResultContent(data) {
    return {
        content: [
            {
                type: "text",
                text: JSONstringify(data),
            },
        ],
    };
}
export function returnResultContent(data, warnings = []) {
    return {
        content: [
            {
                type: "text",
                text: JSONstringify({ data }),
            },
            ...warnings.map((text) => ({
                type: "text",
                text: "Warning: " + text,
            })),
        ],
    };
}
export function returnErrorContent(messages, code = ErrorCode.InvalidRequest) {
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
