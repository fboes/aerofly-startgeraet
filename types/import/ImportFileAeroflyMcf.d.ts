import { ImportFileXMLHandler } from "./ImportFileHandler.js";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class ImportFileAeroflyMcf extends ImportFileXMLHandler {
  static readonly fileExtension = "mcf";
  convert(content: string, flightplan: AeroflyFlight): void;
}
//# sourceMappingURL=ImportFileAeroflyMcf.d.ts.map
