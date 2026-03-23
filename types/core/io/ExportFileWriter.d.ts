import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ExportFileConverter } from "../converter/ExportFileConverter.js";
export declare class ExportFileWriter {
    static exportFlightplanToFile(filename: string, flightplan: AeroflyFlight): void;
    static getConverter(filename: string): new () => ExportFileConverter;
}
//# sourceMappingURL=ExportFileWriter.d.ts.map