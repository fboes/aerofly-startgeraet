import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
import { Point } from "@fboes/geojson";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
export declare class AeroflyFlightToGeoJsonConverter extends AeroflyFlightToStringConverter {
    static readonly fileExtension = "geojson";
    convert(flightplan: AeroflyFlight): string;
    protected getPointForWaypoint(wp: AeroflyNavRouteBase): Point;
    protected getMarkerSymbolForWaypoint(wp: AeroflyNavRouteBase): string;
}
//# sourceMappingURL=AeroflyFlightToGeoJsonConverter.d.ts.map
