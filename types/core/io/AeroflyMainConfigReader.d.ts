import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { Config } from "./Config.js";
export declare class AeroflyMainConfigReaderError extends Error {
    readonly code: "MISSING_SETUP";
    constructor(message: string, code?: "MISSING_SETUP");
}
/**
 * Reader to convert `main.mcf` file into `AeroflyFlight` class instance.
 */
export declare class AeroflyMainConfigReader {
    private config;
    constructor(config: Config);
    get mainCfgFileName(): string;
    read(): AeroflyFlight;
    parseMainMcf(mainMcfContent: string): AeroflyFlight;
    write(flight: AeroflyFlight): void;
}
//# sourceMappingURL=AeroflyMainConfigReader.d.ts.map
