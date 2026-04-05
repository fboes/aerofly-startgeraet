export class ExportFileAeroflyMainMcfExport {
    static fileExtension = "mcf";
    convert(flightplan) {
        return flightplan.toString();
    }
}
