import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
export declare class AeroflyFlightToKmlConverter extends AeroflyFlightToStringConverter {
    static readonly fileExtension = "kml";
    convert(flightplan: AeroflyFlight): string;
    protected xml(str: string): string;
    protected coordinatesToString(wp: AeroflyNavRouteBase): string;
}
//# sourceMappingURL=AeroflyFlightToKmlConverter.d.ts.map
