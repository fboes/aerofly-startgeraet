import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { Config } from "./Config.js";
export declare class AeroflyMainConfigReader {
  private config;
  mainCfgFileName: string;
  constructor(config: Config);
  read(): AeroflyFlight;
  parseMainMcf(mainMcfContent: string): AeroflyFlight;
  write(flight: AeroflyFlight): void;
}
//# sourceMappingURL=AeroflyMainConfigReader.d.ts.map
