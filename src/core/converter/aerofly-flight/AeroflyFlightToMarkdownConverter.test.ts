import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AeroflyFlightToMarkdownConverter } from "./AeroflyFlightToMarkdownConverter.js";
import { AeroflyFlightFixture } from "../../../test/fixtures/AeroflyFlightFixture.js";
import { writeArtifact } from "../../../test/loadFixture.js";

describe("AeroflyFlightToMarkdownConverter", () => {
    it("should do a conversion", () => {
        const flight = new AeroflyFlightFixture();
        const exporter = new AeroflyFlightToMarkdownConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        writeArtifact("test.md", exportString);
    });
});
