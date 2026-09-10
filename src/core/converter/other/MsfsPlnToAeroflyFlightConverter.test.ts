import { describe, it } from "node:test";
import assert from "node:assert";
import { MsfsPlnToAeroflyFlightConverter } from "./MsfsPlnToAeroflyFlightConverter.js";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { loadFixture } from "../../../test/loadFixture.js";
import { assertRoundedEqual } from "../../../test/assertRoundedEqual.js";
import {
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
} from "@fboes/aerofly-custom-missions";

describe("MsfsPlnToAeroflyFlightConverter", () => {
    it("should do a regular import", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("KEYWKMIA_MFS_NoProc.pln");

        const converter = new MsfsPlnToAeroflyFlightConverter();
        converter.convert(content, flight);

        assert.strictEqual(flight.navigation.waypoints.length, 6);

        //console.log(flight.navigation);

        assert.ok(flight.navigation.waypoints[0] instanceof AeroflyNavRouteOrigin);
        assertRoundedEqual(flight.navigation.waypoints[0].latitude, 24.556119);
        assertRoundedEqual(flight.navigation.waypoints[0].longitude, -81.759956);
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
        assertRoundedEqual(flight.navigation.waypoints[5].latitude, 25.795361);
        assertRoundedEqual(flight.navigation.waypoints[5].longitude, -80.290117);
        assert.strictEqual(flight.navigation.waypoints[5].identifier, "KMIA");

        assert.notStrictEqual(flight.navigation.waypoints[4].latitude, flight.navigation.waypoints[5].latitude);
        assert.notStrictEqual(flight.navigation.waypoints[4].longitude, flight.navigation.waypoints[5].longitude);
    });

    it("should fail on trying to import EFB", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("KEYWKMIA_M24.pln");

        const converter = new MsfsPlnToAeroflyFlightConverter();
        assert.throws(() => {
            converter.convert(content, flight);
        });
    });
});
