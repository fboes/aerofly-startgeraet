import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AeroflyFlightToGeoJsonConverter } from "./AeroflyFlightToGeoJsonConverter.js";
import { AeroflyFlightFixture } from "../../../test/fixtures/AeroflyFlightFixture.js";

describe("AeroflyFlightToGeoJsonConverter", () => {
    it("should do a conversion", () => {
        const flight = new AeroflyFlightFixture();
        const exporter = new AeroflyFlightToGeoJsonConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        //console.log(exportString);
    });
});
