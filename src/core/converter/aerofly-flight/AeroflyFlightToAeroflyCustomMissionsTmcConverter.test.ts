import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AeroflyFlightToAeroflyCustomMissionsTmcConverter } from "./AeroflyFlightToAeroflyCustomMissionsTmcConverter.js";
import { AeroflyFlightFixture } from "../../../test/fixtures/AeroflyFlightFixture.js";

describe("AeroflyFlightToAeroflyCustomMissionsTmcConverter", () => {
    it("should do a conversion", () => {
        const flight = new AeroflyFlightFixture();
        const exporter = new AeroflyFlightToAeroflyCustomMissionsTmcConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        //console.log(exportString);
    });
});
