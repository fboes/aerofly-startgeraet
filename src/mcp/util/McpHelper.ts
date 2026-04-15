import { CallToolResult, TextContent, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export class McpHelper {
    static JSONstringify<T>(value: T): string {
        return JSON.stringify(value, null, 2);
    }

    static returnResultContent<T>(data: T, warnings: string[] = []): CallToolResult {
        return {
            content: [
                {
                    type: "text",
                    text: this.JSONstringify({ data }),
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

    static returnErrorContent(messages: string[], code: ErrorCode = ErrorCode.InvalidRequest): CallToolResult {
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
}
