import { AeroflyMainConfigParser } from "./AeroflyMainConfigParser.js";
import { ImportFileXMLConverter } from "./ImportFileConverter.js";
export class AeroflyMcfConverter extends ImportFileXMLConverter {
    convert(content, flightplan) {
        const parser = new AeroflyMainConfigParser();
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
AeroflyMcfConverter.fileExtension = "mcf";
