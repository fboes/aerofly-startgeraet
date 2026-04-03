import { ImportFileConverter } from "./ImportFileConverter.js";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class ImportFileAeroflyMcfConverter implements ImportFileConverter {
    static readonly fileExtension = "mcf";
    convert(content: string, flightplan: AeroflyFlight): void;
}
//# sourceMappingURL=ImportFileAeroflyMcfConverter.d.ts.map
