import { Config } from "../../core/io/Config.js";
import { Command } from "./Command.js";
export declare class SetupCommand implements Command {
  protected config: Config;
  constructor(config: Config);
  execute(): Promise<void>;
}
//# sourceMappingURL=SetupCommand.d.ts.map
