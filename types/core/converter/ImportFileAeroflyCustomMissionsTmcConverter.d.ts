import { ImportFileConverter } from "./ImportFileConverter.js";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class ImportFileAeroflyCustomMissionsTmcConverter extends ImportFileConverter {
    static readonly fileExtension = "tmc";
    getIndices(content: string): string[];
    convert(content: string, flightplan: AeroflyFlight, index?: number): void;
}
//# sourceMappingURL=ImportFileAeroflyCustomMissionsTmcConverter.d.ts.map
