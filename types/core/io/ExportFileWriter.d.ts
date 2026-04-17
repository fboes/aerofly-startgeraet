import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ExportFileConverter } from "../converter/ExportFileConverter.js";
/**
 * Writes a file from an `AeroflyFlight` class instance to an
 * external flight plan file by selecting the appropriate converter.
 */
export declare class ExportFileWriter {
    static exportFlightplanToFile(filename: string, flightplan: AeroflyFlight): void;
    static getConverter(filename: string): new () => ExportFileConverter;
    static getRegistry(): Record<string, (new () => ExportFileConverter) | undefined>;
}
//# sourceMappingURL=ExportFileWriter.d.ts.map
