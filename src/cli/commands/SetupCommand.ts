import { input, confirm, select } from "@inquirer/prompts";
import type { Config } from "../../core/io/Config.js";
import type { Command } from "./Command.js";
import { HelpCommand } from "./HelpCommand.js";
import { writeSuccess } from "../formatter/writeCli.js";

export class SetupCommand implements Command {
    constructor(private config: Config) {}

    async execute(): Promise<number> {
        process.stdout.write(HelpCommand.getHelpText());
        await SetupCommand.configure(this.config);

        return 0;
    }

    static async configure(config: Config): Promise<void> {
        const mainMcfFilePath = await input({
            message: "Path to main.mcf file",
            default: config.mainMcfFilePath ?? "",
            required: true,
        });

        config.mainMcfFilePath = mainMcfFilePath;

        const simbriefUserName = await input({
            message: "SimBrief username (for flightplan import)",
            default: config.simBriefUserName,
            required: false,
            validate(value) {
                if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
                    return "Please enter a valid SimBrief username (alphanumeric and underscores only)";
                }
                return true;
            },
        });

        config.simBriefUserName = simbriefUserName;

        const useSimBriefWeather = await select({
            message: "Use SimBrief weather on import",
            choices: [
                {
                    name: "Use SimBrief origin weather",
                    value: "0",
                },
                {
                    name: "Use SimBrief destination weather",
                    value: "1",
                },
                {
                    name: "Do not use SimBrief weather",
                    value: "-1",
                },
            ],
        });

        config.useSimBriefWeather = Number(useSimBriefWeather);

        const importDirectory = await input({
            message: "Import directory for local flightplan files (e.g. .pln files)",
            default: config.importDirectory,
            required: true,
        });

        config.importDirectory = importDirectory;

        const syncTimeOnStartup = await confirm({
            message: "Automatically synchronize time / date on start-up",
            default: config.syncTimeOnStartup,
        });

        config.syncTimeOnStartup = syncTimeOnStartup;

        writeSuccess("Configuration saved successfully.");
    }
}
