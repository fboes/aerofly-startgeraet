import { Config } from "../../core/io/Config.js";
import type { Command } from "./Command.js";
export declare class SetupCommand implements Command {
    private config;
    constructor(config: Config);
    execute(): Promise<number>;
    static configure(config: Config): Promise<void>;
}
//# sourceMappingURL=SetupCommand.d.ts.map
