import { ImportFileJSONConverter } from "./ImportFileConverter.js";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class ImportFileAeroflyCustomMissionsJsonConverter extends ImportFileJSONConverter {
    static readonly fileExtension = "aerofly.json";
    convert(content: string, flightplan: AeroflyFlight): void;
    private parseFuelLoadSettings;
    private parseNavigationConfig;
    private parseCloudSettings;
    private parseAircraftSettings;
    private parseWindSettings;
    private parseTimeSettings;
    private parseFlightSettings;
    private parseWaypoints;
}
//# sourceMappingURL=ImportFileAeroflyCustomMissionsJsonConverter.d.ts.map