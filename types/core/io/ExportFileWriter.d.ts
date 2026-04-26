import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "../converter/aerofly-flight/AeroflyFlightToStringConverter.js";
/**
 * Writes a file from an `AeroflyFlight` class instance to an
 * external flight plan file by selecting the appropriate converter.
 */
export declare class ExportFileWriter {
    static exportFlightplanToFile(filename: string, flightplan: AeroflyFlight): void;
    static getConverter(filename: string): new () => AeroflyFlightToStringConverter;
    static getRegistry(): Record<string, (new () => AeroflyFlightToStringConverter) | undefined>;
}
//# sourceMappingURL=ExportFileWriter.d.ts.map
