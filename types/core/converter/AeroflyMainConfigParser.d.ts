import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFileParser } from "./AeroflyFileParser.js";
export declare class AeroflyMainConfigParser {
    parser: AeroflyFileParser;
    parse(mainMcfContent: string): AeroflyFlight;
    private parseFuelLoadSettings;
    private parseNavigationConfig;
    private parseCloudSettings;
    private parseAircraftSettings;
    private parseWindSettings;
    private parseTimeSettings;
    private parseFlightSettings;
    private parseWaypoints;
}
//# sourceMappingURL=AeroflyMainConfigParser.d.ts.map