import { describe, it } from "node:test";
import assert from "node:assert";
import { APPLICATION_INFORMATION } from "./getApplicationInformation.js";
describe("ApplicationService", () => {
    it("should return static strings", () => {
        assert.ok(APPLICATION_INFORMATION.name);
        assert.ok(APPLICATION_INFORMATION.version);
        assert.ok(APPLICATION_INFORMATION.nameVersion);
        assert.ok(APPLICATION_INFORMATION.description);
    });
    it("should convert to JSON", () => {
        const json = APPLICATION_INFORMATION;
        assert.ok(json.name);
        assert.ok(json.version);
        assert.ok(json.description);
    });
    it("should create a slug", () => {
        const slug = APPLICATION_INFORMATION.slug;
        assert.strictEqual("aerofly-startgeraet", slug);
    });
});
