export class McpUpdateResult {
    set;
    success;
    warnings;
    constructor(set, success = true, warnings = []) {
        this.set = set;
        this.success = success;
        this.warnings = warnings;
    }
}
