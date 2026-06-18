import { type AeroflyFlight, type AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions";
export type ExportFileConverterWaypointType = "airport" | "runway" | "navaid" | "waypoint";
export declare abstract class AeroflyFlightToStringConverter {
    abstract convert(flightplan: AeroflyFlight): string;
    getFlightplanTitle(flightplan: AeroflyFlight): string;
    getMissionBriefing(flightplan: AeroflyFlight): string;
    /**
     *
     * @param {AeroflyNavRouteBase} wp Waypoint to get altitude / elevation from
     * @returns {number | null} altitude / elevation in meters
     */
    protected getWaypointAltitude(wp: AeroflyNavRouteBase): number | null;
    protected getWaypointAltitudeFt(wp: AeroflyNavRouteBase): number | null;
    protected getWaypointSimplifiedType(wp: AeroflyNavRouteBase): ExportFileConverterWaypointType;
}
//# sourceMappingURL=AeroflyFlightToStringConverter.d.ts.map