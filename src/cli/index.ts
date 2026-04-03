#!/usr/bin/env node

import { CliFormatter } from "./formatter/CliFormatter.js";
import { Config } from "../core/io/Config.js";
import { AeroflyFlightService } from "../core/services/AeroflyFlightService.js";
import { ControllerCommand } from "./commands/Command.js";
import { MenuCommand } from "./commands/MenuCommand.js";
import { MetarCommand } from "./commands/MetarCommand.js";
import { HelpCommand } from "./commands/HelpCommand.js";
import { SetupCommand } from "./commands/SetupCommand.js";
import { SimbriefCommand } from "./commands/SimbriefCommand.js";
import { TimeCommand } from "./commands/TimeCommand.js";

const arg = process.argv[2]?.toLowerCase() || "";

if (arg === "help" || arg === "--help" || arg === "-h") {
    await new HelpCommand().execute();
    process.exit(0);
}

const config = new Config();
if (arg === "setup") {
    await new SetupCommand(config).execute();
    process.exit(0);
}

// Main application logic
try {
    const getControllerCommand = (arg: string): new (controller: AeroflyFlightService) => ControllerCommand => {
        if (!arg) {
            return MenuCommand;
        }

        const registry: Record<string, new (controller: AeroflyFlightService) => ControllerCommand> = {
            metar: MetarCommand,
            simbrief: SimbriefCommand,
            time: TimeCommand,
        };

        return registry[arg] || MenuCommand;
    };

    const controller = new AeroflyFlightService(config);
    const controllerCommand = new (getControllerCommand(arg))(controller);
    await controllerCommand.execute();
} catch (error) {
    CliFormatter.writeCatch(error);

    if (error instanceof Error && error.name === "AeroflyMainConfigReaderError") {
        const setup = new SetupCommand(config);
        await setup.execute();
        process.stdout.write(`\

You will also need to restart the application after changing the
configuration to apply the changes.`);
    }
}
