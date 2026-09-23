import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { XplaneFmsToAeroflyFlightConverter } from "./XplaneFmsToAeroflyFlightConverter.js";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { loadFixture } from "../../../test/loadFixture.js";
import {
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
} from "@fboes/aerofly-custom-missions";

describe("XplaneFmsToAeroflyFlightConverter", () => {
    it("should do KEYWKMIA01 import", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("KEYWKMIA01.fms");

        const converter = new XplaneFmsToAeroflyFlightConverter();
        converter.convert(content, flight);

        assert.strictEqual(flight.navigation.waypoints.length, 6);

        //console.log(flight.navigation);

        assert.ok(flight.navigation.waypoints[0] instanceof AeroflyNavRouteOrigin);
        assert.strictEqual(flight.navigation.waypoints[0].latitude, 24.556119);
        assert.strictEqual(flight.navigation.waypoints[0].longitude, -81.759956);
        assert.strictEqual(flight.navigation.waypoints[0].identifier, "KEYW");

        assert.ok(flight.navigation.waypoints[1] instanceof AeroflyNavRouteDepartureRunway);
        assert.strictEqual(flight.navigation.waypoints[1].identifier, "27");
        assert.strictEqual(flight.navigation.waypoints[1].direction_degree, 270);
        assert.notStrictEqual(flight.navigation.waypoints[0].latitude, flight.navigation.waypoints[1].latitude);
        assert.notStrictEqual(flight.navigation.waypoints[0].longitude, flight.navigation.waypoints[1].longitude);

        assert.ok(flight.navigation.waypoints[4] instanceof AeroflyNavRouteDestinationRunway);
        assert.strictEqual(flight.navigation.waypoints[4].identifier, "30");
        assert.strictEqual(flight.navigation.waypoints[4].direction_degree, 300);

        assert.ok(flight.navigation.waypoints[5] instanceof AeroflyNavRouteDestination);
        assert.strictEqual(flight.navigation.waypoints[5]?.latitude, 25.795361);
        assert.strictEqual(flight.navigation.waypoints[5]?.longitude, -80.290117);
        assert.strictEqual(flight.navigation.waypoints[5]?.identifier, "KMIA");

        assert.notStrictEqual(flight.navigation.waypoints[4].latitude, flight.navigation.waypoints[5].latitude);
        assert.notStrictEqual(flight.navigation.waypoints[4].longitude, flight.navigation.waypoints[5].longitude);
    });

    it("should do OTHHELLX01_Xplane11-12 import", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("OTHHELLX01_Xplane11-12.fms");

        const converter = new XplaneFmsToAeroflyFlightConverter();
        converter.convert(content, flight);

        assert.strictEqual(flight.navigation.waypoints.length, 77);
    });

    it("should do OTHHELLX01_Xplane9-10 import", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("OTHHELLX01_Xplane9-10.fms");

        const converter = new XplaneFmsToAeroflyFlightConverter();
        converter.convert(content, flight);
        assert.strictEqual(flight.navigation.waypoints.length, 77);
    });
});
