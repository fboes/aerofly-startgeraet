import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { BaseAeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.base.js";

export class AeroflyFlightToAeroflyMainMcfConverter extends BaseAeroflyFlightToStringConverter {
    static readonly fileName = "Aerofly Main Configuration File";
    static readonly fileExtension = "mcf";

    convert(flightplan: AeroflyFlight): string {
        return flightplan.toString();
    }
}
