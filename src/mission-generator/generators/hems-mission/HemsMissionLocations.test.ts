import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { HemsMissionLocations } from "./HemsMissionLocations.js";
import { DIR_FIXTURE } from "../../../test/loadFixture.js";
import { Point } from "@fboes/geojson";
import type { LocationExtended } from "../../util/Location.type.js";

const LOCATION_EDHG: LocationExtended = {
    identifier: "EDHG",
    position: new Point(10.457620941302837, 53.24756138354581, 49.02),
};

const LOCATION_EGEO: LocationExtended = {
    identifier: "EGEO",
    position: new Point(-5.3984619465384185, 56.464572641198856, 7),
};

const DIR_FIXTURE_MISSION_GENERATOR = DIR_FIXTURE + "/mission-generator";

describe("HemsMissionLocations", () => {
    it("loads locations", { todo: true }, async () => {
        const locations = new HemsMissionLocations();

        assert.ok(locations);
        assert.strictEqual(locations.getAllLocations().length, 0);

        const count = await locations.loadLocationsFile(LOCATION_EDHG, DIR_FIXTURE_MISSION_GENERATOR);

        console.log(locations.getAllLocations());
        assert.strictEqual(count, 41);

        const allLocations = locations.getAllLocations();
        assert.strictEqual(allLocations.length, count, "Number of all locations matches number of all locations ;)");

        const allHospitals = locations.findAllHospitalLocations();
        assert.ok(allHospitals.length < count);
        //console.log("Hospitals", allHospitals);

        const allEmergencies = locations.findAllEmergencyLocations();
        assert.ok(allEmergencies.length < count);
        //console.log("Emergencies", allEmergencies);

        assert.ok(allEmergencies.length + allHospitals.length <= count);
    });

    it("find a random emergency waypoints in a given distance range", { todo: true }, async () => {
        const locations = new HemsMissionLocations();
        await locations.loadLocationsFile(LOCATION_EDHG, DIR_FIXTURE_MISSION_GENERATOR);

        const airportPoint = new Point(10.457620941302837, 53.24756138354581, 49.02);
        const emergency = locations.findRandomEmergencyLocation(airportPoint, 35_000, 40_000);

        assert.ok(emergency);
        assert.strictEqual(emergency.title, "Bispingen Tank & Rast");
        //console.log(emergency);
    });

    it("finds the closest hospital", { todo: true }, async () => {
        const locations = new HemsMissionLocations();
        await locations.loadLocationsFile(LOCATION_EDHG, DIR_FIXTURE_MISSION_GENERATOR);

        const hospital = locations.findNearestHospitalLocation(LOCATION_EDHG);

        assert.ok(hospital);
        assert.strictEqual(hospital.identifier, "de0819");
        //console.log(hospital);
    });

    it("finds heliports", { todo: true }, async () => {
        const locations = new HemsMissionLocations();
        await locations.loadLocationsFile(LOCATION_EGEO, DIR_FIXTURE_MISSION_GENERATOR);

        const heliports = locations.findAllHeliportLocations();
        assert.strictEqual(heliports.length, 1);

        const heliport = locations.findHeliportLocationByIcaoId("EGEO");
        assert.strictEqual(heliport?.direction, 281);
        assert.strictEqual(heliport.approaches?.length, 2);
    });
});
