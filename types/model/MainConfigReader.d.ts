import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { Config } from "./Config.js";
export declare class MainConfigReader {
    private config;
    mainCfgFileName: string;
    constructor(config: Config);
    read(): AeroflyFlight;
    parseMainMcf(mainMcfContent: string): AeroflyFlight;
    write(flight: AeroflyFlight): void;
    getFallback(): AeroflyFlight;
}
//# sourceMappingURL=MainConfigReader.d.ts.map