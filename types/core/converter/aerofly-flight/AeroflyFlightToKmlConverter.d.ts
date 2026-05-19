import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
export declare class AeroflyFlightToKmlConverter extends AeroflyFlightToStringConverter {
    static readonly fileExtension = "kml";
    convert(flightplan: AeroflyFlight): string;
    private xml;
    private coordinatesToString;
}
//# sourceMappingURL=AeroflyFlightToKmlConverter.d.ts.map