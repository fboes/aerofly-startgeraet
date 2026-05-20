import { writeln, writeSuccess } from "../formatter/writeCli.js";
import { ControllerCommand } from "./Command.js";
export class MetarCommand extends ControllerCommand {
    async execute() {
        const choice = this.controller.getFlightplanDepartureAirportString();
        writeln(`Importing METAR for ${choice}...`);
        await this.controller.setWeatherFromMETAR(choice);
        writeSuccess("Weather imported successfully");
        return 0;
    }
}
