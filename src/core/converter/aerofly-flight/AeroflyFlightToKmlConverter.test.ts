import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AeroflyFlightToKmlConverter } from "./AeroflyFlightToKmlConverter.js";
import { AeroflyFlightFixture } from "../../../test/fixtures/AeroflyFlightFixture.js";
import { writeArtifact } from "../../../test/loadFixture.js";

describe("AeroflyFlightToKmlConverter", () => {
    it("should do a conversion", () => {
        const flight = new AeroflyFlightFixture();
        const exporter = new AeroflyFlightToKmlConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        writeArtifact("test.kml", exportString);
    });
});
