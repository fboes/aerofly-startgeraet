import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { AeroflyFlightToMarkdownConverter } from "./AeroflyFlightToMarkdownConverter.js";
describe("AeroflyFlightToMarkdownConverter", () => {
    it("should do a conversion", () => {
        const flight = new AeroflyFlightFallback(true);
        const exporter = new AeroflyFlightToMarkdownConverter();
        const exportString = exporter.convert(flight);
        assert.ok(exportString);
        //console.log(exportString);
    });
});
