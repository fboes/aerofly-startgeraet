import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
export declare class MetarToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    getIndices(content: string): string[];
    convert(content: string, flightplan: AeroflyFlight, index?: number): void;
    protected getLines(content: string): string[];
}
//# sourceMappingURL=MetarToAeroflyFlightConverter.d.ts.map
