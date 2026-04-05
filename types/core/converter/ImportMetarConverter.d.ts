import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ImportFileConverter } from "./ImportFileConverter.js";
export declare class ImportMetarConverter extends ImportFileConverter {
    getIndices(content: string): string[];
    convert(content: string, flightplan: AeroflyFlight, index?: number): void;
    protected getLines(content: string): string[];
}
//# sourceMappingURL=ImportMetarConverter.d.ts.map
