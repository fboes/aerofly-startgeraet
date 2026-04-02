import { ImportFileConverter } from "./ImportFileConverter.js";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class ImportFileAeroflyCustomMissionsTmcConverter implements ImportFileConverter {
  static readonly fileExtension = "tmc";
  convert(content: string, flightplan: AeroflyFlight): void;
}
//# sourceMappingURL=ImportFileAeroflyCustomMissionsTmcConverter.d.ts.map
