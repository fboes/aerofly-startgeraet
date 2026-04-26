import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
export class AeroflyFlightToAeroflyMainMcfConverter extends AeroflyFlightToStringConverter {
    static fileExtension = "mcf";
    convert(flightplan) {
        return flightplan.toString();
    }
}
