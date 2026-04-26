import { JSONToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class AeroflyCustomMissionsJsonToAeroflyFlightConverter extends JSONToAeroflyFlightConverter {
    static readonly fileExtension = "aerofly.json";
    getIndices(content: string): string[];
    convert(content: string, flightplan: AeroflyFlight, index?: number): void;
    private parseFuelLoadSettings;
    private parseNavigationConfig;
    private parseCloudSettings;
    private parseAircraftSettings;
    private parseWindSettings;
    private parseTimeSettings;
    private parseFlightSettings;
    private parseWaypoints;
}
//# sourceMappingURL=AeroflyCustomMissionsJsonToAeroflyFlightConverter.d.ts.map
