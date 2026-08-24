import { describe, it } from "node:test";
import assert from "node:assert";
import { XplaneFmsToAeroflyFlightConverter } from "./XplaneFmsToAeroflyFlightConverter.js";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { loadFixture } from "../../../test/loadFixture.js";
describe("XplaneFmsToAeroflyFlightConverter", () => {
    it("should do KEYWKMIA01 import", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("KEYWKMIA01.fms");
        const converter = new XplaneFmsToAeroflyFlightConverter();
        converter.convert(content, flight);
        assert.strictEqual(flight.navigation.waypoints.length, 6);
        assert.strictEqual(flight.navigation.waypoints[0]?.latitude, 24.556119);
        assert.strictEqual(flight.navigation.waypoints[0]?.longitude, -81.759956);
        assert.strictEqual(flight.navigation.waypoints[0]?.identifier, "KEYW");
        assert.strictEqual(flight.navigation.waypoints[5]?.latitude, 25.795361);
        assert.strictEqual(flight.navigation.waypoints[5]?.longitude, -80.290117);
        assert.strictEqual(flight.navigation.waypoints[5]?.identifier, "KMIA");
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
