import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ExportFileConverter } from "./ExportFileConverter.js";
export declare class ExportFileAeroflyCustomMissionsTmcConverter extends ExportFileConverter {
    static readonly fileExtension = "tmc";
    convert(flightplan: AeroflyFlight): string;
}
//# sourceMappingURL=ExportFileAeroflyCustomMissionsTmcConverter.d.ts.map
