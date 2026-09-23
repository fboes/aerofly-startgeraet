import { AeroflyMainConfigParser } from "../parser/AeroflyMainConfigParser.js";
import { BaseStringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.base.js";
import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";

export class AeroflyMcfToImportFileConverter extends BaseStringToAeroflyFlightConverter {
    static readonly fileName = "Aerofly Main Configuration File";
    static readonly fileExtension = "mcf";

    convert(content: string, flightplan: AeroflyFlight): void {
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
