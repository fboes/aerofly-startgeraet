import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class AeroflyMcfToImportFileConverter extends StringToAeroflyFlightConverter {
    static readonly fileExtension = "mcf";
    convert(content: string, flightplan: AeroflyFlight): void;
}
//# sourceMappingURL=AeroflyMcfToImportFileConverter.d.ts.map
