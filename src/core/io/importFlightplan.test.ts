import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ConfigFixture } from "../../test/fixtures/ConfigFixture.js";
import { findImportFiles } from "./importFlightplan.js";

describe("importFlightplan", async () => {
    it("should find files from fixture directory", async () => {
        const config = new ConfigFixture("importFlightplan");
        const files = await findImportFiles(config);

        assert.ok(config.importDirectory);
        assert.strictEqual(files.length, 15);
        //console.log(files);
    });
});
