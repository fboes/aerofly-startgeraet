export declare class McpHelper {
    static JSONstrinigify<T>(value: T): string;
    static JSONstringifyResult<T>(result: T, warnings?: string[], success?: boolean): string;
    static returnResultContent<T>(
        result: T,
        warnings?: string[],
        success?: boolean,
    ): {
        content: {
            type: "text";
            text: string;
        }[];
        isError?: boolean;
    };
}
//# sourceMappingURL=McpHelper.d.ts.map
