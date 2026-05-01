import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { AeroflyCustomMissionsJsonToAeroflyFlightConverter } from "./AeroflyCustomMissionsJsonToAeroflyFlightConverter.js";

describe("AeroflyCustomMissionsJsonToAeroflyFlightConverter", () => {
    it("should find multiple flight plans in a .aerofly.json file", () => {
        const content = fs.readFileSync(
            path.join(import.meta.dirname, "../../../..", "src/test/fixtures", "matthias-rust.aerofly.json"),
            "utf-8",
        );

        const converter = new AeroflyCustomMissionsJsonToAeroflyFlightConverter();
        const indices = converter.getIndices(content);

        assert.strictEqual(1, indices.length);
        assert.strictEqual("Matthias Rust: Landung am Roten Platz", indices[0]);
    });

    it("should convert .aerofly.json files into AeroflyFlight classes", () => {
        const flight = new AeroflyFlightFallback();

        const content = fs.readFileSync(
            path.join(import.meta.dirname, "../../../..", "src/test/fixtures", "matthias-rust.aerofly.json"),
            "utf-8",
        );

        const converter = new AeroflyCustomMissionsJsonToAeroflyFlightConverter();
        converter.convert(content, flight);

        assert.strictEqual(flight.aircraft.name, "c172");
        assert.strictEqual(flight.fuelLoadSetting.fuelMass, 159);
        assert.strictEqual(flight.fuelLoadSetting.payloadMass, 80);
        assert.strictEqual(flight.navigation.waypoints.length, 10);
    });
});
