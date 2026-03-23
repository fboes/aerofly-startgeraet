export class ExportFileAeroflyMainMcfExport {
    convert(flightplan) {
        return flightplan.toString();
    }
}
ExportFileAeroflyMainMcfExport.fileExtension = "mcf";
