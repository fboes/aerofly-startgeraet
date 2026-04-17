import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
export type ExportFileConverterWaypointType = "airport" | "runway" | "navaid" | "waypoint";
export declare abstract class ExportFileConverter {
    abstract convert(flightplan: AeroflyFlight): string;
    getFlightplanTitle(flightplan: AeroflyFlight): string;
    protected getWaypointAltitude(wp: AeroflyNavRouteBase): number | null;
    protected getWaypointSimplifiedType(wp: AeroflyNavRouteBase): ExportFileConverterWaypointType;
    protected getWaypointType(
        wp: AeroflyNavRouteBase,
    ): import("@fboes/aerofly-custom-missions/types/dto/AeroflyMissionCheckpoint.js").AeroflyMissionCheckpointType;
}
//# sourceMappingURL=ExportFileConverter.d.ts.map
