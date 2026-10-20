import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ConfigFixture } from "../../test/fixtures/ConfigFixture.js";
import { findImportFiles } from "./importFlightplan.js";

describe("importFlightplan", () => {
    it("should find files from fixture directory", () => {
        const config = new ConfigFixture();
        const files = findImportFiles(config);

        assert.ok(config.importDirectory);
        assert.strictEqual(files.length, 12);
        //console.log(files);
    });
});
