import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AeroflyFlightToAeroflyMainMcfConverter } from "./AeroflyFlightToAeroflyMainMcfConverter.js";
import { AeroflyFlightFixture } from "../../../test/fixtures/AeroflyFlightFixture.js";

describe("AeroflyFlightToAeroflyMainMcfConverter", () => {
    it("should do a conversion", () => {
        const flight = new AeroflyFlightFixture();
        const exporter = new AeroflyFlightToAeroflyMainMcfConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        //console.log(exportString);
    });
});
