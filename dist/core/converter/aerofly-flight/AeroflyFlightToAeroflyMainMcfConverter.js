import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
export class AeroflyFlightToAeroflyMainMcfConverter extends AeroflyFlightToStringConverter {
    static fileName = "Aerofly Main Configuration File";
    static fileExtension = "mcf";
    convert(flightplan) {
        return flightplan.toString();
    }
}
