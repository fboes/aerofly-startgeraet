import path from "node:path";
import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePct } from "./PoiCreatorToolFile.js";
import { loadFixture } from "../../test/loadFixture.js";

describe("parsePct", () => {
    it("should parse a valid PCT JSON file", () => {
        const pct = loadFixture(path.join("pct", "__startgeraet_hems_cn02.json"));
        const pctJson = JSON.parse(pct);

        const pctFile = parsePct(pctJson);
        assert.ok(pctFile);
        assert.strictEqual(pctFile.objects.length, 2);

        const xrefs = pctFile.objects;
        assert.strictEqual(xrefs.length, 2);
        assert.strictEqual(xrefs[0]?.kind, "airport_light");
        assert.strictEqual(xrefs[1]?.kind, "xref");
    });

    it("should throw an error for invalid PCT JSON", () => {
        assert.throws(() => parsePct({}), /is no compatible /);
    });
});
