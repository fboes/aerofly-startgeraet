import { CliFormatter } from "../formatter/CliFormatter.js";
import { ControllerCommand } from "./Command.js";
import { input } from "@inquirer/prompts";
export class SimbriefCommand extends ControllerCommand {
    async execute() {
        let returnState = 0;
        let simBriefUserName = this.controller.config.simBriefUserName;
        if (simBriefUserName === undefined || simBriefUserName.trim() === "") {
            simBriefUserName = await input({
                message: "SimBrief username (for flightplan import)",
                default: simBriefUserName,
                required: true,
                validate(value) {
                    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                        return "Please enter a valid SimBrief username (alphanumeric and underscores only)";
                    }
                    return true;
                },
            });
            this.controller.config.simBriefUserName = simBriefUserName;
        }
        CliFormatter.writeln(`Importing flightplan from SimBrief for user ${simBriefUserName}...`);
        try {
            await this.controller.importFlightplanFromSimBrief(simBriefUserName, this.controller.config.simBriefWeatherFromDestination);
            CliFormatter.writeSuccess("Flightplan imported successfully");
            CliFormatter.writeln(`Imported flightplan: ${this.controller.getFlightplanWaypointsString()}`);
        }
        catch (error) {
            CliFormatter.writeCatch(error);
            returnState = 1;
        }
        return returnState;
    }
}
