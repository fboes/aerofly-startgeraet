import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { AeroflyCustomMissionsTmcToAeroflyFlightConverter } from "./AeroflyCustomMissionsTmcToAeroflyFlightConverter.js";
import { loadFixture } from "../../../test/loadFixture.js";
describe("AeroflyCustomMissionsTmcToAeroflyFlightConverter", () => {
    it("should find multiple flight plans in a Aerofly Custom Missions file", () => {
        const content = loadFixture("custom_missions_user.tmc");
        const converter = new AeroflyCustomMissionsTmcToAeroflyFlightConverter();
        const indices = converter.getIndices(content);
        assert.strictEqual(2, indices.length);
        assert.strictEqual("Landing practice #1: Concord / Buchanan Field", indices[0]);
    });
    it("should convert Aerofly Custom Missions files into AeroflyFlight classes", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("custom_missions_user.tmc");
        const converter = new AeroflyCustomMissionsTmcToAeroflyFlightConverter();
        converter.convert(content, flight);
        assert.strictEqual(flight.navigation.waypoints.length, 4);
        assert.strictEqual(flight._missionTitle, "Landing practice #1: Concord / Buchanan Field");
        assert.ok(flight._missionBriefing);
    });
    it("should convert Aerofly Custom Missions files into AeroflyFlight classes, getting the second flight plan", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("custom_missions_user.tmc");
        const converter = new AeroflyCustomMissionsTmcToAeroflyFlightConverter();
        converter.convert(content, flight, 1);
        assert.strictEqual(flight._missionTitle, "Landing practice #2: Concord / Buchanan Field");
    });
});
