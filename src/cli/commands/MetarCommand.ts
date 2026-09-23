import { writeln, writeSuccess } from "../formatter/writeCli.js";
import { BaseControllerCommand } from "./ControllerCommand.base.js";

export class MetarCommand extends BaseControllerCommand {
    async execute(): Promise<number> {
        const choice = this.controller.getFlightplanDepartureAirportString();

        writeln(`Importing METAR for ${choice}...`);
        await this.controller.setWeatherFromMETAR(choice);
        writeSuccess("Weather imported successfully");

        return 0;
    }
}
