export class McpUpdateResult<T> {
    constructor(
        public readonly set: T,
        public readonly success: boolean = true,
        public readonly warnings: string[] = [],
    ) {}
}
