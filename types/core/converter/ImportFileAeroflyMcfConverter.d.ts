import { ImportFileXMLConverter } from "./ImportFileConverter.js";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class AeroflyMcfConverter extends ImportFileXMLConverter {
    static readonly fileExtension = "mcf";
    convert(content: string, flightplan: AeroflyFlight): void;
}
//# sourceMappingURL=ImportFileAeroflyMcfConverter.d.ts.map