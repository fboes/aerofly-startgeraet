import { ExportFileConverter } from "./ExportFileConverter.js";
export class ExportFileAeroflyMainMcfExport extends ExportFileConverter {
    static fileExtension = "mcf";
    convert(flightplan) {
        return flightplan.toString();
    }
}
