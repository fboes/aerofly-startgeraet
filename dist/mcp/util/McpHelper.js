import { ErrorCode } from "@modelcontextprotocol/sdk/types.js";
export class McpHelper {
    static JSONstringify(value) {
        return JSON.stringify(value, null, 2);
    }
    static returnResultContent(data, warnings = []) {
        return {
            content: [
                {
                    type: "text",
                    text: this.JSONstringify({ data }),
                },
                ...warnings.map((text) => ({
                    type: "text",
                    text: "Warning: " + text,
                })),
            ],
        };
    }
    static returnErrorContent(messages, code = ErrorCode.InvalidRequest) {
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
}
