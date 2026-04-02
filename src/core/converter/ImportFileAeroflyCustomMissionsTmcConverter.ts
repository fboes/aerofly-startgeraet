import { AeroflyCustomMissionsParser } from "./AeroflyCustomMissionsParser.js";
import { ImportFileConverter } from "./ImportFileConverter.js";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";

export class ImportFileAeroflyCustomMissionsTmcConverter implements ImportFileConverter {
  static readonly fileExtension = "tmc";

  convert(content: string, flightplan: AeroflyFlight): void {
    const parser = new AeroflyCustomMissionsParser();
    const newFlightplan = parser.parse(content);
    flightplan.aircraft = newFlightplan.aircraft;
    flightplan.clouds = newFlightplan.clouds;
    flightplan.visibility = newFlightplan.visibility;
    flightplan.flightSetting = newFlightplan.flightSetting;
    flightplan.fuelLoadSetting = newFlightplan.fuelLoadSetting;
    flightplan.timeUtc = newFlightplan.timeUtc;
    flightplan.wind = newFlightplan.wind;
    flightplan.navigation = newFlightplan.navigation;
  }
}
