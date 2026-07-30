import { describe, it } from "node:test";
import assert from "node:assert";
import { MsfsPlnToAeroflyFlightConverter } from "./MsfsPlnToAeroflyFlightConverter.js";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { loadFixture } from "../../../test/loadFixture.js";

describe("MsfsPlnToAeroflyFlightConverter", () => {
    it("should do a regular import", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("KEYWKMIA_MFS_NoProc.pln");

        const converter = new MsfsPlnToAeroflyFlightConverter();
        converter.convert(content, flight);

        assert.strictEqual(flight.navigation.waypoints.length, 6);
    });
});
