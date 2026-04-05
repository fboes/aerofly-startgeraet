import { AeroflyCustomMissionsParser } from "./AeroflyCustomMissionsParser.js";
import { ImportFileConverter } from "./ImportFileConverter.js";
export class ImportFileAeroflyCustomMissionsTmcConverter extends ImportFileConverter {
    static fileExtension = "tmc";
    getIndices(content) {
        const parser = new AeroflyCustomMissionsParser();
        return parser.getMissionNames(content);
    }
    convert(content, flightplan, index = 0) {
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
