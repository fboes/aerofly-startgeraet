#!/usr/bin/env node
import { CliFormatter } from "../core/formatter/CliFormatter.js";
import { Config } from "../core/io/Config.js";
import { AeroflyFlightService } from "../core/services/AeroflyFlightService.js";
import { MenuCommand } from "./commands/MenuCommand.js";
import { SetupCommand } from "./commands/SetupCommand.js";
const config = new Config();
try {
    const controller = new AeroflyFlightService(config);
    const startgeraet = new MenuCommand(controller);
    process.stdout.write("\x1Bc");
    let next = "mainMenu";
    while (next !== "exit") {
        try {
            next = await startgeraet[next]();
        }
        catch (error) {
            if (error instanceof Error && error.name === "ExitPromptError") {
                next = "exit";
            }
            else {
                next = "mainMenu";
                CliFormatter.writeCatch(error);
            }
        }
        process.stdout.write("\n");
    }
}
catch (error) {
    CliFormatter.writeCatch(error);
    const setup = new SetupCommand(config);
    await setup.setup();
    process.stdout.write(`\

You will also need to restart the application after changing the
configuration to apply the changes.`);
}
process.stdout.write("Goodbye\n");
