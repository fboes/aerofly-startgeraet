import { type AeroflyFlight } from "@fboes/aerofly-custom-missions";
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
    /**
     * Altitude for TO
     */
    altitude_ft: number | null;
    /**
     * Frequency for TO
     */
    frequency_mhz: number | null;
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
    constructor(aeroflyFlight: AeroflyFlight);
    getRouteLegs(cruiseSpeed_kts?: null | number): RoutePlanServiceLeg[];
    getRoute(cruiseSpeed_kts?: null | number): RoutePlanServiceRoute;
    private getCoordinatesFromWaypoint;
    /**
     *
     * @param {AeroflyNavRouteBase} wp Waypoint to get altitude / elevation from
     * @returns {number | null} altitude / elevation in meters
     */
    private getWaypointAltitude;
    private getFrequencyMhz;
    private getCruiseSpeedKts;
    /**
     * @see https://e6bx.com/e6b
     *
     * @param course in degrees
     * @param tas_kts in knots
     * @returns ground speed in knots, true heading
     */
    private getWindCorrection;
}
//# sourceMappingURL=RoutePlanService.d.ts.map