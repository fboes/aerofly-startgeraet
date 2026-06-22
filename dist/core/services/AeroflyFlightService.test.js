import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightService } from "./AeroflyFlightService.js";
import { ConfigFixture } from "../../test/fixtures/ConfigFixture.js";
import { AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteDestinationRunway, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
describe("AeroflyFlightService", () => {
    it("should create flightplans", () => {
        const config = new ConfigFixture();
        const service = new AeroflyFlightService(config);
        const flightplan = service.setFlightplan({
            identifier: "KEYW",
            longitude: 0,
            latitude: 0,
            elevation_ft: 0,
        }, {
            identifier: "KMIA",
            longitude: 2,
            latitude: 2,
            elevation_ft: 2,
        }, {
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
        });
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
    it("should calculate fuel & payload correctly and do capping", () => {
        const config = new ConfigFixture();
        const service = new AeroflyFlightService(config);
        const testAircraft = "c172", megaFuel = 2000, megaPayload = 2000;
        service.setAircraft(testAircraft, "");
        const flight = service.getAeroflyFlight();
        assert.strictEqual(flight.aircraft.name, testAircraft, "Aircraft has been set correctly");
        const aircraftData = service.getAircraftData();
        assert.strictEqual(aircraftData?.aeroflyCode, testAircraft, "Aircraft data has been found for aircraft");
        assert.ok(aircraftData.maximumFuelMassKg !== undefined);
        assert.ok(aircraftData.maximumFuelMassKg < megaFuel, `Aircraft has less than ${megaFuel.toString()} of max fuel mass`);
        assert.ok(aircraftData.maximumPayloadKg !== undefined);
        assert.ok(aircraftData.maximumPayloadKg < megaPayload, `Aircraft has less than ${megaPayload.toString()}kg of max payload mass`);
        /*console.log("aircraftData", {
            maximumFuelMassKg: aircraftData.maximumFuelMassKg,
            maximumPayloadKg: aircraftData.maximumPayloadKg,
            operatingEmptyMassKg: aircraftData.operatingEmptyMassKg,
        });*/
        service.setFuelAndPayload(megaFuel, megaPayload);
        assert.ok(flight.fuelLoadSetting.fuelMass < megaFuel, "Even if set to beyond max fuelMass, fuelMass is capped to max fuelMass");
        assert.ok(flight.fuelLoadSetting.payloadMass < megaPayload, "Even if set to beyond max payloadMass, payloadMass is capped to max payloadMass");
        const maxPayload = service.getMaxRemainingPayload();
        assert.ok(maxPayload < aircraftData?.maximumPayloadKg, "Available max payload is smaller than absolute max payload due to fuel eating up the payload");
        assert.ok(flight.fuelLoadSetting.payloadMass < aircraftData?.maximumPayloadKg, "Also the payload added is smaller than absolute max payload");
        /*console.log("Flight settings", { ...flight.fuelLoadSetting, maxPayload });*/
    });
});
