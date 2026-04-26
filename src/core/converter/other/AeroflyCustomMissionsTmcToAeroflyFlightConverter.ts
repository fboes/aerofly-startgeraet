import { AeroflyCustomMissionsParser } from "../parser/AeroflyCustomMissionsParser.js";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";

export class AeroflyCustomMissionsTmcToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    static readonly fileExtension = "tmc";

    getIndices(content: string): string[] {
        const parser = new AeroflyCustomMissionsParser();
        return parser.getMissionNames(content);
    }

    convert(content: string, flightplan: AeroflyFlight, index = 0): void {
        const parser = new AeroflyCustomMissionsParser();
        const newFlightplan = parser.parse(content, index);
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
