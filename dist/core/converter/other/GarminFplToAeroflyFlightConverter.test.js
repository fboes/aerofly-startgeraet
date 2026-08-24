import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { GarminFplToAeroflyFlightConverter } from "./GarminFplToAeroflyFlightConverter.js";
import { loadFixture } from "../../../test/loadFixture.js";
describe("GarminFplToAeroflyFlightConverter", () => {
    it("should be able to find multiple flight plans in a Garmin FPL file", () => {
        const content = loadFixture("KBLI.fpl");
        const converter = new GarminFplToAeroflyFlightConverter();
        const indices = converter.getIndices(content);
        assert.strictEqual(2, indices.length);
        assert.strictEqual("KCLM KBLI", indices[0]);
    });
    it("should convert Garmin FPL files into AeroflyFlight classes", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("KBLI.fpl");
        const converter = new GarminFplToAeroflyFlightConverter();
        converter.convert(content, flight);
        assert.strictEqual(flight.navigation.waypoints.length, 5);
    });
    it("should convert the second flight plan from a Garmin FPL files into AeroflyFlight classes", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("KBLI.fpl");
        const converter = new GarminFplToAeroflyFlightConverter();
        converter.convert(content, flight, 1);
        assert.strictEqual(flight.navigation.waypoints.length, 2);
    });
    it("should convert Garmin FPL wit correct coordinates", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("KMIA.fpl");
        const converter = new GarminFplToAeroflyFlightConverter();
        converter.convert(content, flight);
        assert.strictEqual(flight.navigation.waypoints.length, 3);
        assert.strictEqual(flight.navigation.waypoints[0]?.latitude, 24.556119);
        assert.strictEqual(flight.navigation.waypoints[0]?.longitude, -81.759956);
        assert.strictEqual(flight.navigation.waypoints[0]?.identifier, "KEYW");
        assert.strictEqual(flight.navigation.waypoints[2]?.latitude, 25.795361);
        assert.strictEqual(flight.navigation.waypoints[2]?.longitude, -80.290117);
        assert.strictEqual(flight.navigation.waypoints[2]?.identifier, "KMIA");
    });
});
