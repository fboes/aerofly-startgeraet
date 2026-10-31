import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { HemsMissionLocations, type HemsMissionLocation } from "./HemsMissionLocations.js";
import { DIR_FIXTURE } from "../../../test/loadFixture.js";
import { Point } from "@fboes/geojson";

const WAYPOINT_EDHG: HemsMissionLocation = {
    longitude: 10.457620941302837,
    latitude: 53.24756138354581,
    altitude_m: 49.02,
    identifier: "EDHG",
    payload: {
        point: new Point(10.457620941302837, 53.24756138354581, 49.02),
    },
};

const WAYPOINT_EGEO: HemsMissionLocation = {
    longitude: -5.3984619465384185,
    latitude: 56.464572641198856,
    altitude_m: 7,
    identifier: "EGEO",
    payload: {
        point: new Point(-5.3984619465384185, 56.464572641198856, 7),
    },
};

const DIR_FIXTURE_MISSION_GENERATOR = DIR_FIXTURE + "/mission-generator";

describe("HemsMissionLocations", () => {
    it("loads locations", async () => {
        const locations = new HemsMissionLocations();

        assert.ok(locations);
        assert.strictEqual(locations.getAllLocations().length, 0);

        const count = await locations.loadLocationsFile(WAYPOINT_EDHG, DIR_FIXTURE_MISSION_GENERATOR);
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

    it("find a random emergency waypoints in a given distance range", async () => {
        const locations = new HemsMissionLocations();
        await locations.loadLocationsFile(WAYPOINT_EDHG, DIR_FIXTURE_MISSION_GENERATOR);

        const airportPoint = new Point(10.457620941302837, 53.24756138354581, 49.02);
        const emergency = locations.findRandomEmergencyWaypoint(airportPoint, 35_000, 40_000);

        assert.ok(emergency);
        assert.strictEqual(emergency.title, "Bispingen Tank & Rast");
        //console.log(emergency);
    });

    it("finds the closest hospital", async () => {
        const locations = new HemsMissionLocations();
        await locations.loadLocationsFile(WAYPOINT_EDHG, DIR_FIXTURE_MISSION_GENERATOR);

        const hospital = locations.findNearestHospitalWaypoint(WAYPOINT_EDHG);

        assert.ok(hospital);
        assert.strictEqual(hospital.identifier, "de0819");
        //console.log(hospital);
    });

    it("finds heliports", async () => {
        const locations = new HemsMissionLocations();
        await locations.loadLocationsFile(WAYPOINT_EGEO, DIR_FIXTURE_MISSION_GENERATOR);

        const heliports = locations.findAllHeliportWaypoints();
        assert.strictEqual(heliports.length, 1);

        const heliport = locations.findHeliportWaypointByIcaoId("EGEO");
        assert.strictEqual(heliport?.payload.direction, 281);
        assert.strictEqual(heliport.payload.approaches?.length, 2);
    });
});
