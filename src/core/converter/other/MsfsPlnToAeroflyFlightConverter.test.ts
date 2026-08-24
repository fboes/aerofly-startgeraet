import { describe, it } from "node:test";
import assert from "node:assert";
import { MsfsPlnToAeroflyFlightConverter } from "./MsfsPlnToAeroflyFlightConverter.js";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { loadFixture } from "../../../test/loadFixture.js";
import { assertRoundedEqual } from "../../../test/assertRoundedEqual.js";

describe("MsfsPlnToAeroflyFlightConverter", () => {
    it("should do a regular import", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("KEYWKMIA_MFS_NoProc.pln");

        const converter = new MsfsPlnToAeroflyFlightConverter();
        converter.convert(content, flight);

        assert.strictEqual(flight.navigation.waypoints.length, 6);

        assertRoundedEqual(flight.navigation.waypoints[0]?.latitude, 24.556119);
        assertRoundedEqual(flight.navigation.waypoints[0]?.longitude, -81.759956);
        assert.strictEqual(flight.navigation.waypoints[0]?.identifier, "KEYW");

        assertRoundedEqual(flight.navigation.waypoints[5]?.latitude, 25.795361);
        assertRoundedEqual(flight.navigation.waypoints[5]?.longitude, -80.290117);
        assert.strictEqual(flight.navigation.waypoints[5]?.identifier, "KMIA");
    });
});
