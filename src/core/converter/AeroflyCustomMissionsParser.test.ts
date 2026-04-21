import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { AeroflyCustomMissionsParser } from "./AeroflyCustomMissionsParser.js";

describe("AeroflyCustomMissionsParser", () => {
    it("should find multiple missions from TMC files", () => {
        const content = fs.readFileSync(
            path.join(import.meta.dirname, "../../..", "src/test/fixtures", "mach_loop.tmc"),
            "utf-8",
        );

        const parser = new AeroflyCustomMissionsParser();
        const indices = parser.getMissionNames(content);

        assert.strictEqual(5, indices.length);
        assert.strictEqual("Star Wars Canyon", indices[4]);
    });

    it("should convert TMC files into AeroflyFlight classes", () => {
        const content = fs.readFileSync(
            path.join(import.meta.dirname, "../../..", "src/test/fixtures", "custom_missions_user.tmc"),
            "utf-8",
        );

        const parser = new AeroflyCustomMissionsParser();
        const flight = parser.parse(content);

        assert.strictEqual(flight.aircraft.name, "c172");
        assert.strictEqual(flight.fuelLoadSetting.fuelMass, 80, "Reads values, even if commented out");
        assert.strictEqual(flight.fuelLoadSetting.payloadMass, 90);

        //console.log(flight);
    });
});
