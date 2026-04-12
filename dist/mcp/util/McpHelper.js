import { McpUpdateResult } from "./McpUpdateResult.js";
export class McpHelper {
    static JSONstrinigify(value) {
        return JSON.stringify(value, null, 2);
    }
    static JSONstringifyResult(result, warnings = [], success = true) {
        return this.JSONstrinigify(new McpUpdateResult(result, success, warnings));
    }
    static returnResultContent(result, warnings = [], success = true) {
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
