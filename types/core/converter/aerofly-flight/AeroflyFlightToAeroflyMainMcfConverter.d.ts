import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
export declare class AeroflyFlightToAeroflyMainMcfConverter extends AeroflyFlightToStringConverter {
    static readonly fileExtension = "mcf";
    convert(flightplan: AeroflyFlight): string;
}
//# sourceMappingURL=AeroflyFlightToAeroflyMainMcfConverter.d.ts.map
