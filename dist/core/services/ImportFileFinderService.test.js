import { describe, it } from "node:test";
import assert from "node:assert";
import { ImportFileFinderService } from "./ImportFileFinderService.js";
import { ConfigFixture } from "../../test/fixtures/ConfigFixture.js";
describe("ImportFileFinderService", () => {
    it("should find files from fixture directory", () => {
        const config = new ConfigFixture();
        const finder = new ImportFileFinderService(config);
        const files = finder.findImportFiles();
        assert.strictEqual(4, files?.length);
        //console.log(files);
    });
});
