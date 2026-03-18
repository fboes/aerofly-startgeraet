import { input } from "@inquirer/prompts";
import { CliFormatter } from "../../core/formatter/CliFormatter.js";
import { Config } from "../../core/io/Config.js";
import { Command } from "./Command.js";

export class SetupCommand implements Command {
  constructor(protected config: Config) {}

  async execute(): Promise<void> {
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
