import { CliFormatter } from "../formatter/CliFormatter.js";
import { ControllerCommand } from "./Command.js";

export class MetarCommand extends ControllerCommand {
  async execute(): Promise<number> {
    const choice = this.controller.getFlightplanDepartureAirportString();

    CliFormatter.writeln(`Importing METAR for ${choice}...`);
    await this.controller.setWeatherFromMETAR(choice);
    CliFormatter.writeSuccess("Weather imported successfully");

    return 0;
  }
}
