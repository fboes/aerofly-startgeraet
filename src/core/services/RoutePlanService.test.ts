import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RoutePlanService } from "./RoutePlanService.js";
import { AeroflyFlightFixture } from "../../test/fixtures/AeroflyFlightFixture.js";

describe("RoutePlanService", () => {
    it("should calculate the legs and times with wind from 0°", () => {
        const flight = new AeroflyFlightFixture();
        flight.wind.speed_kts = 10;
        flight.wind.gust_kts = 0;
        flight.wind.directionInDegree = 0;
        const routePlan = new RoutePlanService(flight);
        const legs = routePlan.getRouteLegs();

        assert.strictEqual(flight.navigation.waypoints.length, legs.length + 1);
        assert.strictEqual(flight.navigation.waypoints[1]?.identifier, legs[1]?.from);
        assert.strictEqual(flight.navigation.waypoints[2]?.identifier, legs[1]?.to);
        assert.strictEqual(legs[1]?.to, legs[2]?.from);

        //console.log(legs[0]);
        const trackDeg = legs[1]?.track_deg ?? -1;
        assert.ok(75 < trackDeg && trackDeg < 76, "Tracking to KMTH");
        assert.strictEqual(legs[1]?.wind_deg, flight.wind.directionInDegree, "Wind direction");
        assert.ok(70 < legs[1]?.heading_deg && legs[1]?.heading_deg < 71, "Wind from the left, correction to the left");
    });

    it("should calculate the legs and times with wind from 180°", () => {
        const flight = new AeroflyFlightFixture();
        flight.wind.speed_kts = 10;
        flight.wind.gust_kts = 0;
        flight.wind.directionInDegree = 180;
        const routePlan = new RoutePlanService(flight);
        const legs = routePlan.getRouteLegs();

        assert.strictEqual(flight.navigation.waypoints.length, legs.length + 1);
        assert.strictEqual(flight.navigation.waypoints[1]?.identifier, legs[1]?.from);
        assert.strictEqual(flight.navigation.waypoints[2]?.identifier, legs[1]?.to);
        assert.strictEqual(legs[1]?.to, legs[2]?.from);

        //console.log(legs[0]);
        const trackDeg = legs[1]?.track_deg ?? -1;
        assert.ok(75 < trackDeg && trackDeg < 76, "Tracking to KMTH");
        assert.strictEqual(legs[1]?.wind_deg, flight.wind.directionInDegree, "Wind direction");
        assert.ok(
            79 < legs[1]?.heading_deg && legs[1]?.heading_deg < 80,
            "Wind from the right, correction to the right",
        );
    });

    it("should calculate the legs and times with wind from 90°", () => {
        const flight = new AeroflyFlightFixture();
        flight.wind.speed_kts = 10;
        flight.wind.gust_kts = 0;
        flight.wind.directionInDegree = 90;
        const routePlan = new RoutePlanService(flight);
        const legs = routePlan.getRouteLegs();

        //console.log(legs);

        assert.strictEqual(flight.navigation.waypoints.length, legs.length + 1);
        assert.strictEqual(flight.navigation.waypoints[1]?.identifier, legs[1]?.from);
        assert.strictEqual(flight.navigation.waypoints[2]?.identifier, legs[1]?.to);
        assert.strictEqual(legs[1]?.to, legs[2]?.from);

        //console.log(legs[0]);
        const trackDeg = legs[1]?.track_deg ?? -1;
        assert.ok(75 < trackDeg && trackDeg < 76, "Tracking to KMTH");
        assert.strictEqual(legs[1]?.wind_deg, flight.wind.directionInDegree, "Wind direction");
        assert.ok(
            76 < legs[1]?.heading_deg && legs[1]?.heading_deg < 77,
            "Wind from the front, correction to the right",
        );
    });
});
