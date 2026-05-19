import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
export declare class AeroflyFlightToGeoJsonConverter extends AeroflyFlightToStringConverter {
    static readonly fileExtension = "geojson";
    convert(flightplan: AeroflyFlight): string;
    private getPointForWaypoint;
    private getMarkerSymbolForWaypoint;
}
//# sourceMappingURL=AeroflyFlightToGeoJsonConverter.d.ts.map