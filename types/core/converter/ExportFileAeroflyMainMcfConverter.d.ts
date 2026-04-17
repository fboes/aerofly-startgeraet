import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ExportFileConverter } from "./ExportFileConverter.js";
export declare class ExportFileAeroflyMainMcfExport extends ExportFileConverter {
    static readonly fileExtension = "mcf";
    convert(flightplan: AeroflyFlight): string;
}
//# sourceMappingURL=ExportFileAeroflyMainMcfConverter.d.ts.map
