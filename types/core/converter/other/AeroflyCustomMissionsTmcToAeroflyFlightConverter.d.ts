import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class AeroflyCustomMissionsTmcToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    static readonly fileExtension = "tmc";
    getIndices(content: string): string[];
    convert(content: string, flightplan: AeroflyFlight, index?: number): void;
}
//# sourceMappingURL=AeroflyCustomMissionsTmcToAeroflyFlightConverter.d.ts.map
