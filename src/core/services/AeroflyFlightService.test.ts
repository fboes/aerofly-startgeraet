import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightService } from "./AeroflyFlightService.js";
import { ConfigFixture } from "../../test/fixtures/ConfigFixture.js";
import {
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";

describe("AeroflyFlightService", () => {
    it("should create flightplans", () => {
        const config = new ConfigFixture();
        const service = new AeroflyFlightService(config);

        const flightplan = service.setFlightplan(
            {
                identifier: "KEYW",
                longitude: 0,
                latitude: 0,
                elevation_ft: 0,
            },
            {
                identifier: "KMIA",
                longitude: 2,
                latitude: 2,
                elevation_ft: 2,
            },
            {
                waypoints: [
                    {
                        identifier: "MTH",
                        longitude: 1,
                        latitude: 1,
                        altitude_ft: 1,
                    },
                ],
                cruiseAltitudeFt: 3,
                departureRunway: {
                    identifier: "09",
                    length: 0.5,
                    direction_degree: 91,
                },
                destinationRunway: {
                    identifier: "03L",
                    length: 2.5,
                },
            },
        );
        assert.strictEqual(5, flightplan.waypoints.length);

        const wp0 = flightplan.waypoints[0];
        assert.ok(wp0 instanceof AeroflyNavRouteOrigin);

        const wp1 = flightplan.waypoints[1];
        assert.ok(wp1 instanceof AeroflyNavRouteDepartureRunway);
        assert.strictEqual(91, wp1.direction_degree);

        const wp2 = flightplan.waypoints[2];
        assert.ok(wp2 instanceof AeroflyNavRouteWaypoint);

        const wp3 = flightplan.waypoints[3];
        assert.ok(wp3 instanceof AeroflyNavRouteDestinationRunway);

        const wp4 = flightplan.waypoints[4];
        assert.ok(wp4 instanceof AeroflyNavRouteDestination);

        //console.log(flightplan);
    });
});
