import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";

export class AeroflyFlightToAeroflyMainMcfConverter extends AeroflyFlightToStringConverter {
    static readonly fileExtension = "mcf";

    convert(flightplan: AeroflyFlight): string {
        return flightplan.toString();
    }
}
