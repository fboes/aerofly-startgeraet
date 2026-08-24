import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "../data/AeroflyFlightFallback.js";
import { RoutePlanService } from "./RoutePlanService.js";

describe("RoutePlanService", () => {
    it("should calculate the legs and times with wind from 0°", () => {
        const flight = new AeroflyFlightFallback(true);
        flight.wind.speed_kts = 10;
        flight.wind.directionInDegree = 0;
        const routePlan = new RoutePlanService(flight);
        const legs = routePlan.getRouteLegs();

        assert.strictEqual(flight.navigation.waypoints.length, legs.length + 1);
        assert.strictEqual(flight.navigation.waypoints[0]?.identifier, legs[0]?.from);
        assert.strictEqual(flight.navigation.waypoints[1]?.identifier, legs[0]?.to);
        assert.strictEqual(legs[0]?.to, legs[1]?.from);

        //console.log(legs[0]);
        const trackDeg = legs[0]?.track_deg ?? -1;
        assert.ok(75 < trackDeg && trackDeg < 76, "Tracking to KMTH");
        assert.strictEqual(legs[0]?.wind_deg, flight.wind.directionInDegree, "Wind direction");
        assert.ok(70 < legs[0]?.heading_deg && legs[0]?.heading_deg < 71, "Wind from the left, correction to the left");
    });

    it("should calculate the legs and times with wind from 180°", () => {
        const flight = new AeroflyFlightFallback(true);
        flight.wind.speed_kts = 10;
        flight.wind.directionInDegree = 180;
        const routePlan = new RoutePlanService(flight);
        const legs = routePlan.getRouteLegs();

        assert.strictEqual(flight.navigation.waypoints.length, legs.length + 1);
        assert.strictEqual(flight.navigation.waypoints[0]?.identifier, legs[0]?.from);
        assert.strictEqual(flight.navigation.waypoints[1]?.identifier, legs[0]?.to);
        assert.strictEqual(legs[0]?.to, legs[1]?.from);

        //console.log(legs[0]);
        const trackDeg = legs[0]?.track_deg ?? -1;
        assert.ok(75 < trackDeg && trackDeg < 76, "Tracking to KMTH");
        assert.strictEqual(legs[0]?.wind_deg, flight.wind.directionInDegree, "Wind direction");
        assert.ok(
            79 < legs[0]?.heading_deg && legs[0]?.heading_deg < 80,
            "Wind from the right, correction to the right",
        );
    });

    it("should calculate the legs and times with wind from 90°", () => {
        const flight = new AeroflyFlightFallback(true);
        flight.wind.speed_kts = 10;
        flight.wind.directionInDegree = 90;
        const routePlan = new RoutePlanService(flight);
        const legs = routePlan.getRouteLegs();

        //console.log(legs);

        assert.strictEqual(flight.navigation.waypoints.length, legs.length + 1);
        assert.strictEqual(flight.navigation.waypoints[0]?.identifier, legs[0]?.from);
        assert.strictEqual(flight.navigation.waypoints[1]?.identifier, legs[0]?.to);
        assert.strictEqual(legs[0]?.to, legs[1]?.from);

        //console.log(legs[0]);
        const trackDeg = legs[0]?.track_deg ?? -1;
        assert.ok(75 < trackDeg && trackDeg < 76, "Tracking to KMTH");
        assert.strictEqual(legs[0]?.wind_deg, flight.wind.directionInDegree, "Wind direction");
        assert.ok(
            76 < legs[0]?.heading_deg && legs[0]?.heading_deg < 77,
            "Wind from the front, correction to the right",
        );
    });
});
