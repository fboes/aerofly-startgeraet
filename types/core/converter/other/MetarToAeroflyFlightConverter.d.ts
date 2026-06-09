import { type AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
export declare class MetarToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    getIndices(content: string): string[];
    convert(content: string, flightplan: AeroflyFlight, index?: number): void;
    private getLines;
}
//# sourceMappingURL=MetarToAeroflyFlightConverter.d.ts.map