import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFileParser } from "./AeroflyFileParser.js";
export declare class AeroflyCustomMissionsParser {
    parser: AeroflyFileParser;
    parse(content: string): AeroflyFlight;
    private parseFuelLoadSettings;
    private parseNavigationConfig;
    private parseCloudSettings;
    private parseAircraftSettings;
    private parseWindSettings;
    private parseTimeSettings;
    private parseFlightSettings;
    private parseWaypoints;
}
//# sourceMappingURL=AeroflyCustomMissionsParser.d.ts.map