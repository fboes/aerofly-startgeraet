import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AeroflyFlightToPoiCreationJson } from "./AeroflyFlightToPoiCreationJson.js";
import { AeroflyFlightFixture } from "../../../test/fixtures/AeroflyFlightFixture.js";
import { writeArtifact } from "../../../test/loadFixture.js";

describe("AeroflyFlightToPoiCreatorJson", () => {
    it("should do a conversion", () => {
        const flight = new AeroflyFlightFixture();
        const exporter = new AeroflyFlightToPoiCreationJson();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        writeArtifact("__test.json", exportString);
    });
});
