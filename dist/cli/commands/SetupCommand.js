import { input, confirm } from "@inquirer/prompts";
import { CliFormatter } from "../formatter/CliFormatter.js";
import { HelpCommand } from "./HelpCommand.js";
export class SetupCommand {
    config;
    constructor(config) {
        this.config = config;
    }
    async execute() {
        process.stdout.write(HelpCommand.getHelpText());
        await SetupCommand.configure(this.config);
        return 0;
    }
    static async configure(config) {
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
        const simBriefWeatherFromDestination = await confirm({
            message: "Use SimBrief weather from destination airport (instead of departure airport)?",
            default: config.simBriefWeatherFromDestination,
        });
        config.simBriefWeatherFromDestination = simBriefWeatherFromDestination;
        const importDirectory = await input({
            message: "Import directory for local flightplan files (e.g. .pln files)",
            default: config.importDirectory,
            required: true,
        });
        config.importDirectory = importDirectory;
        const syncTimeOnStartup = await confirm({
            message: "Autmmoatically synchronize time / date on start-up",
            default: config.syncTimeOnStartup,
        });
        config.syncTimeOnStartup = syncTimeOnStartup;
        CliFormatter.writeSuccess("Configuration saved successfully.");
    }
}
