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
        assert.strictEqual(flight.navigation.waypoints[0].identifier, legs[0].from);
        assert.strictEqual(flight.navigation.waypoints[1].identifier, legs[0].to);
        assert.strictEqual(legs[0].to, legs[1].from);
    });

    it("should calculate the legs and times with wind from 180°", () => {
        const flight = new AeroflyFlightFallback(true);
        flight.wind.speed_kts = 10;
        flight.wind.directionInDegree = 180;
        const routePlan = new RoutePlanService(flight);
        const legs = routePlan.getRouteLegs();

        assert.strictEqual(flight.navigation.waypoints.length, legs.length + 1);
        assert.strictEqual(flight.navigation.waypoints[0].identifier, legs[0].from);
        assert.strictEqual(flight.navigation.waypoints[1].identifier, legs[0].to);
        assert.strictEqual(legs[0].to, legs[1].from);
    });

    it("should calculate the legs and times with wind from 90", () => {
        const flight = new AeroflyFlightFallback(true);
        flight.wind.speed_kts = 10;
        flight.wind.directionInDegree = 90;
        const routePlan = new RoutePlanService(flight);
        const legs = routePlan.getRouteLegs();

        //console.log(legs);

        assert.strictEqual(flight.navigation.waypoints.length, legs.length + 1);
        assert.strictEqual(flight.navigation.waypoints[0].identifier, legs[0].from);
        assert.strictEqual(flight.navigation.waypoints[1].identifier, legs[0].to);
        assert.strictEqual(legs[0].to, legs[1].from);
    });
});
