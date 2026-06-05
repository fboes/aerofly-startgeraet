import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class AeroflyCustomMissionsParser {
    private readonly parser;
    getMissionNames(content: string): string[];
    parse(content: string, index?: number): AeroflyFlight;
    private getMissions;
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