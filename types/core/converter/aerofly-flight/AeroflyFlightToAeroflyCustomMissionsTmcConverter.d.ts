import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
export declare class AeroflyFlightToAeroflyCustomMissionsTmcConverter extends AeroflyFlightToStringConverter {
    static readonly fileExtension = "tmc";
    convert(flightplan: AeroflyFlight): string;
}
//# sourceMappingURL=AeroflyFlightToAeroflyCustomMissionsTmcConverter.d.ts.map
