import { input } from "@inquirer/prompts";
import { CliFormatter } from "../../core/formatter/CliFormatter.js";
export class SetupCommand {
    constructor(config) {
        this.config = config;
    }
    async setup() {
        process.stdout.write(`\

Welcome to the Aerofly Startgerät. It allows you to set up your flight in a more
convenient way.

As the Startgerät is missing some configuration, we need to set it up first.
Please provide the following information to get started.

Please note that you can change all of these settings later in the configuration
menu.

`);
        const mainMcfFilePath = await input({
            message: "Path to main.mcf file",
            default: this.config.mainMcfFilePath ?? "",
            required: true,
        });
        this.config.mainMcfFilePath = mainMcfFilePath;
        CliFormatter.writeSuccess("Configuration saved successfully.");
    }
}
