import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { HemsMissionLocations } from "./HemsMissionLocations.js";
import { DIR_FIXTURE } from "../../../test/loadFixture.js";

describe("HemsMissionLocations", () => {
    it("loads locations", async () => {
        const locations = new HemsMissionLocations(0, 60);

        assert.ok(locations);
        assert.strictEqual(locations.getAllLocations().length, 0);

        const count = locations.loadLocations("EDHG", DIR_FIXTURE + "/startgeraet");
        assert.strictEqual(count, 41);

        const allLocations = locations.getAllLocations();
        assert.strictEqual(allLocations.length, count, "Number of all locations matches number of all locations ;)");

        const allHospitals = locations.getAllHospitalWaypoints();
        assert.ok(allHospitals.length < count);
        //console.log("Hospitals", allHospitals);

        const allEmergencies = locations.getAllEmergencyWaypoints();
        assert.ok(allEmergencies.length < count);
        //console.log("Emergencies", allEmergencies);

        assert.ok(allEmergencies.length + allHospitals.length <= count);
    });
});
