import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ExportFileConverter } from "./ExportFileConverter.js";

export class ExportFileAeroflyMainMcfExport implements ExportFileConverter {
  static readonly fileExtension = "mcf";

  convert(flightplan: AeroflyFlight): string {
    return flightplan.toString();
  }
}
