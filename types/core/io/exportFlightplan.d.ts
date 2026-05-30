import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "../converter/aerofly-flight/AeroflyFlightToStringConverter.js";
/**
 * Writes a file from an `AeroflyFlight` class instance to an
 * external flight plan file by selecting the appropriate converter.
 */
export declare const EXPORT_FILE_TYPES: string[];
export declare function exportFlightplanToString(filename: string, flightplan: AeroflyFlight): string;
export declare function exportFlightplanToFile(filename: string, flightplan: AeroflyFlight): void;
export declare function getExportConverter(filename: string): new () => AeroflyFlightToStringConverter;
//# sourceMappingURL=exportFlightplan.d.ts.map
