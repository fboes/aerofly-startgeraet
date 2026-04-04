import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import { AeroflyFlightFallback } from "../util/AeroflyFlightFallback.js";
import { ImportFileAeroflyCustomMissionsJsonConverter } from "./ImportFileAeroflyCustomMissionsJsonConverter.js";

describe("ImportFileAeroflyCustomMissionsJsonConverter", () => {
    it("should convert .aerofly.json files into AeroflyFlight classes", () => {
        const flight = new AeroflyFlightFallback();

        const content = fs.readFileSync("./src/test/fixtures/matthias-rust.aerofly.json", "utf-8");

        const converter = new ImportFileAeroflyCustomMissionsJsonConverter();
        converter.convert(content, flight);

        assert.strictEqual(flight.aircraft.name, "c172");
        assert.strictEqual(flight.fuelLoadSetting.fuelMass, 159);
        assert.strictEqual(flight.fuelLoadSetting.payloadMass, 80);
        assert.strictEqual(flight.navigation.waypoints.length, 10);
    });
});
