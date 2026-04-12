import { McpUpdateResult } from "./McpUpdateResult.js";

export class McpHelper {
    static JSONstrinigify<T>(value: T): string {
        return JSON.stringify(value, null, 2);
    }

    static JSONstringifyResult<T>(result: T, warnings: string[] = [], success = true): string {
        return this.JSONstrinigify(new McpUpdateResult(result, success, warnings));
    }

    static returnResultContent<T>(
        result: T,
        warnings: string[] = [],
        success = true,
    ): {
        content: {
            type: "text";
            text: string;
        }[];
        isError?: boolean;
    } {
        return {
            content: [
                {
                    type: "text",
                    text: this.JSONstringifyResult(result, warnings, success),
                },
            ],
            isError: !success ? true : undefined,
        };
    }
}
