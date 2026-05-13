import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraftService } from "./AeroflyAircraftService.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
import { Point } from "@fboes/geojson";
export type RoutePlanServiceLeg = {
    from: string;
    to: string;
    track_deg: number;
    wind_deg: number;
    heading_deg: number;
    trueAirspeed_kts: number;
    windSpeed_kts: number;
    groundSpeed_kts: number;
    distance_nm: number;
    distanceTotal_nm: number;
    estimatedTimeEnroute_min: number;
    estimatedTimeEnrouteTotal_min: number;
    altitude_ft: number | null;
    onGround: boolean;
};
export type RoutePlanServiceRoute = {
    from: string;
    to: string;
    distanceTotal_nm: number;
    estimatedTimeEnrouteTotal_min: number;
    altitude_ft: number | null;
};
export declare class RoutePlanService {
    private aeroflyFlight;
    protected readonly aicraftService: AeroflyAircraftService;
    constructor(aeroflyFlight: AeroflyFlight);
    getRouteLegs(cruiseSpeed_kts?: null | number): RoutePlanServiceLeg[];
    getRoute(cruiseSpeed_kts?: null | number): RoutePlanServiceRoute;
    protected getCoordinatesFromWaypoint(wp: AeroflyNavRouteBase): Point;
    /**
     *
     * @param {AeroflyNavRouteBase} wp Waypoint to get altitude / elevation from
     * @returns {number | null} altitude / elevation in meters
     */
    protected getWaypointAltitude(wp: AeroflyNavRouteBase): number | null;
    protected getCruiseSpeedKts(): number;
    /**
     * @see https://e6bx.com/e6b
     *
     * @param course in degrees
     * @param tas_kts in knots
     * @returns ground speed in knots, true heading
     */
    protected getWindCorrection(
        course: number,
        wind_deg: number,
        tas_kts: number,
        windSpeed_kts: number,
    ): {
        ground_speed: number;
        heading_rad: number;
        heading: number;
    };
}
//# sourceMappingURL=RoutePlanService.d.ts.map
