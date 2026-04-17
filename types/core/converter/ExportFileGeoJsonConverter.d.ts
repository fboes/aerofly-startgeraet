import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ExportFileConverter } from "./ExportFileConverter.js";
import { Point } from "@fboes/geojson";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
export declare class ExportFileGeoJsonConverter extends ExportFileConverter {
    static readonly fileExtension = "geojson";
    convert(flightplan: AeroflyFlight): string;
    protected getPointForWaypoint(wp: AeroflyNavRouteBase): Point;
    protected getMarkerSymbolForWaypoint(wp: AeroflyNavRouteBase): string;
}
//# sourceMappingURL=ExportFileGeoJsonConverter.d.ts.map
