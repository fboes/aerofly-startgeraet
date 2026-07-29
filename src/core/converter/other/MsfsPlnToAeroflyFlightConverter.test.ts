import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { MsfsPlnToAeroflyFlightConverter } from "./MsfsPlnToAeroflyFlightConverter.js";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";

describe("MsfsPlnToAeroflyFlightConverter", () => {
    it("should do a regular import", () => {
        const flight = new AeroflyFlightFallback();
        const content = fs.readFileSync(
            path.join(import.meta.dirname, "../../../..", "src/test/fixtures", "KEYWKMIA_MFS_NoProc.pln"),
            "utf-8",
        );

        const converter = new MsfsPlnToAeroflyFlightConverter();
        converter.convert(content, flight);

        assert.strictEqual(flight.navigation.waypoints.length, 6);
    });
});
