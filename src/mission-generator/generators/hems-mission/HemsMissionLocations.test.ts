import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { HemsMissionLocations, type HemsMissionLocation } from "./HemsMissionLocations.js";
import { DIR_FIXTURE } from "../../../test/loadFixture.js";
import { Point } from "@fboes/geojson";

describe("HemsMissionLocations", () => {
    it("loads locations", async () => {
        const locations = new HemsMissionLocations();

        assert.ok(locations);
        assert.strictEqual(locations.getAllLocations().length, 0);

        const count = locations.loadLocationsFile("EDHG", DIR_FIXTURE + "/startgeraet");
        assert.strictEqual(count, 41);

        const allLocations = locations.getAllLocations();
        assert.strictEqual(allLocations.length, count, "Number of all locations matches number of all locations ;)");

        const allHospitals = locations.findAllHospitalWaypoints();
        assert.ok(allHospitals.length < count);
        //console.log("Hospitals", allHospitals);

        const allEmergencies = locations.findAllEmergencyWaypoints();
        assert.ok(allEmergencies.length < count);
        //console.log("Emergencies", allEmergencies);

        assert.ok(allEmergencies.length + allHospitals.length <= count);
    });

    it("find a random emergency waypoints in a given distance range", () => {
        const locations = new HemsMissionLocations();
        locations.loadLocationsFile("EDHG", DIR_FIXTURE + "/startgeraet");

        const airportPoint = new Point(10.457620941302837, 53.24756138354581, 49.02);
        const emergency = locations.findRandomEmergencyWaypoint(airportPoint, 35_000, 40_000);

        assert.ok(emergency);
        assert.strictEqual(emergency.title, "Bispingen Tank & Rast");
        //console.log(emergency);
    });

    it("finds the closest hospital", () => {
        const locations = new HemsMissionLocations();
        locations.loadLocationsFile("EDHG", DIR_FIXTURE + "/startgeraet");

        const emergencyData: HemsMissionLocation = {
            longitude: 10.457620941302837,
            latitude: 53.24756138354581,
            altitude_m: 49.02,
            identifier: "EDHG",
            payload: {
                point: new Point(10.457620941302837, 53.24756138354581, 49.02),
            },
        };
        const hospital = locations.findNearestHospitalWaypoint(emergencyData);

        assert.ok(hospital);
        assert.strictEqual(hospital.identifier, "de0819");
        //console.log(hospital);
    });
});
