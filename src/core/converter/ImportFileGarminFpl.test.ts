import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { AeroflyFlightFallback } from "../data/AeroflyFlightFallback.js";
import { ImportFileGarminFplConverter } from "./ImportFileGarminFplConverter.js";

describe("ImportFileGarminFplConverter", () => {
    it("should find multiple flight plans in a Garmin FPL file", () => {
        const content = fs.readFileSync(
            path.join(import.meta.dirname, "../../..", "src/test/fixtures", "KBLI.fpl"),
            "utf-8",
        );

        const converter = new ImportFileGarminFplConverter();
        const indices = converter.getIndices(content);

        assert.strictEqual(2, indices.length);
        assert.strictEqual("KCLM KBLI", indices[0]);
    });

    it("should convert Garmin FPL files into AeroflyFlight classes", () => {
        const flight = new AeroflyFlightFallback();

        const content = fs.readFileSync(
            path.join(import.meta.dirname, "../../..", "src/test/fixtures", "KBLI.fpl"),
            "utf-8",
        );

        const converter = new ImportFileGarminFplConverter();
        converter.convert(content, flight);

        assert.strictEqual(flight.navigation.waypoints.length, 5);
    });

    it("should convert Garmin FPL files into AeroflyFlight classes, getting the second flight plan", () => {
        const flight = new AeroflyFlightFallback();

        const content = fs.readFileSync(
            path.join(import.meta.dirname, "../../..", "src/test/fixtures", "KBLI.fpl"),
            "utf-8",
        );

        const converter = new ImportFileGarminFplConverter();
        converter.convert(content, flight, 1);

        assert.strictEqual(flight.navigation.waypoints.length, 2);
    });
});
