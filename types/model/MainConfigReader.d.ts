import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { Config } from "./Config.js";
import { AeroflyFileParser } from "./AeroflyFileParser.js";
export declare class AeroflyMainConfigReader {
  private config;
  mainCfgFileName: string;
  constructor(config: Config);
  read(): AeroflyFlight;
  parseMainMcf(mainMcfContent: string): AeroflyFlight;
  write(flight: AeroflyFlight): void;
  getFallback(): AeroflyFlight;
}
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
//# sourceMappingURL=MainConfigReader.d.ts.map
