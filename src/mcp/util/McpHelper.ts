export class McpHelper {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static JSONstrinigify(value: any): string {
        return JSON.stringify(value, null, 2);
    }
}
