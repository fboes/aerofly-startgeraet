import { AeroflyFlight, AeroflyNavRouteBase, AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteDestinationRunway, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
import { Point } from "@fboes/geojson";
import { getAeroflyAircraft } from "./getAeroflyAircraft.js";
export class RoutePlanService {
    aeroflyFlight;
    constructor(aeroflyFlight) {
        this.aeroflyFlight = aeroflyFlight;
    }
    getRouteLegs(cruiseSpeed_kts = null) {
        if (!cruiseSpeed_kts) {
            cruiseSpeed_kts = this.getCruiseSpeedKts();
        }
        if (cruiseSpeed_kts === null) {
            throw new Error("Cruise speed is not defined");
        }
        if (cruiseSpeed_kts <= 0) {
            throw new Error("Cruise speed must be a positive number");
        }
        let lastWaypoint = null;
        let lastCoordinates = null;
        let distanceTotal_nm = 0;
        let estimatedTimeEnrouteTotal_min = 0;
        const legs = [];
        for (const wp of this.aeroflyFlight.navigation.waypoints) {
            const coords = this.getCoordinatesFromWaypoint(wp);
            if (lastWaypoint !== null && lastCoordinates !== null) {
                const vector = lastCoordinates.getVectorTo(coords);
                const distance_nm = vector.meters / 1852;
                const track_deg = vector.bearing;
                const onGround = wp instanceof AeroflyNavRouteDepartureRunway ||
                    lastWaypoint instanceof AeroflyNavRouteDestinationRunway;
                const trueAirspeed_kts = onGround ? 20 : cruiseSpeed_kts;
                const windSpeed_kts = this.aeroflyFlight.wind.speed_kts;
                const wind_deg = this.aeroflyFlight.wind.directionInDegree;
                const windCorrection = this.getWindCorrection(track_deg, wind_deg, trueAirspeed_kts, windSpeed_kts);
                const groundSpeed_kts = onGround ? trueAirspeed_kts : windCorrection.ground_speed;
                const heading_deg = onGround ? track_deg : windCorrection.heading;
                const estimatedTimeEnroute_min = (distance_nm / groundSpeed_kts) * 60;
                estimatedTimeEnrouteTotal_min += estimatedTimeEnroute_min;
                distanceTotal_nm += distance_nm;
                const leg = {
                    from: lastWaypoint.identifier,
                    to: wp.identifier,
                    track_deg,
                    wind_deg,
                    heading_deg,
                    trueAirspeed_kts,
                    windSpeed_kts,
                    groundSpeed_kts,
                    distance_nm,
                    distanceTotal_nm,
                    estimatedTimeEnroute_min,
                    estimatedTimeEnrouteTotal_min,
                    altitude_ft: lastCoordinates.elevation ? lastCoordinates.elevation * 3.28084 : null,
                    onGround,
                };
                legs.push(leg);
            }
            lastCoordinates = this.getCoordinatesFromWaypoint(wp);
            lastWaypoint = wp;
        }
        return legs;
    }
    getRoute(cruiseSpeed_kts = null) {
        const legs = this.getRouteLegs(cruiseSpeed_kts);
        if (legs.length < 1) {
            throw new Error("No flight plan legs found");
        }
        const lastLeg = legs[legs.length - 1];
        return {
            from: legs[0].from,
            to: lastLeg.to,
            distanceTotal_nm: lastLeg.distanceTotal_nm,
            estimatedTimeEnrouteTotal_min: lastLeg.estimatedTimeEnrouteTotal_min,
            altitude_ft: lastLeg.altitude_ft,
        };
    }
    getCoordinatesFromWaypoint(wp) {
        return new Point(wp.longitude, wp.latitude, this.getWaypointAltitude(wp));
    }
    /**
     *
     * @param {AeroflyNavRouteBase} wp Waypoint to get altitude / elevation from
     * @returns {number | null} altitude / elevation in meters
     */
    getWaypointAltitude(wp) {
        if (wp instanceof AeroflyNavRouteWaypoint) {
            return wp.altitude;
        }
        else if (wp instanceof AeroflyNavRouteOrigin ||
            wp instanceof AeroflyNavRouteDepartureRunway ||
            wp instanceof AeroflyNavRouteDestinationRunway ||
            wp instanceof AeroflyNavRouteDestination) {
            return wp.elevation;
        }
        return null;
    }
    getCruiseSpeedKts() {
        const aircraft = getAeroflyAircraft(this.aeroflyFlight.aircraft.name);
        if (!aircraft) {
            throw Error(`No matching aircraft found for ${this.aeroflyFlight.aircraft}`);
        }
        return aircraft.cruiseSpeedKts;
    }
    /**
     * @see https://e6bx.com/e6b
     *
     * @param course in degrees
     * @param tas_kts in knots
     * @returns ground speed in knots, true heading
     */
    getWindCorrection(course, wind_deg, tas_kts, windSpeed_kts) {
        const getGroundSpeeed = (tas_kts, wind_speed, deltaRad, correctionRad) => {
            if (deltaRad === 0) {
                return tas_kts - wind_speed;
            }
            else if (deltaRad === Math.PI) {
                return tas_kts + wind_speed;
            }
            return (Math.sin(deltaRad - correctionRad) * tas_kts) / Math.sin(deltaRad);
        };
        const wind_direction_rad = wind_deg * (Math.PI / 180);
        const course_rad = course * (Math.PI / 180);
        const deltaRad = wind_direction_rad - course_rad;
        const correctionRad = deltaRad === 0 || deltaRad === Math.PI ? 0 : Math.asin((windSpeed_kts * Math.sin(deltaRad)) / tas_kts);
        const heading_rad = correctionRad + course_rad;
        const ground_speed = getGroundSpeeed(tas_kts, windSpeed_kts, deltaRad, correctionRad);
        return {
            ground_speed,
            heading_rad,
            heading: ((heading_rad * 180) / Math.PI) % 360,
        };
    }
}
