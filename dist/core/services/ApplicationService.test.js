import { describe, it } from "node:test";
import assert from "node:assert";
import { ApplicationService } from "./ApplicationService.js";
describe("ApplicationService", () => {
    it("should return static strings", () => {
        assert.ok(ApplicationService.getApplicationName());
        assert.ok(ApplicationService.getApplicationVersion());
        assert.ok(ApplicationService.getApplicationNameVersion());
        assert.ok(ApplicationService.getApplicationDescription());
    });
    it("should convert to JSON", () => {
        const json = ApplicationService.toJSON();
        assert.ok(json.name);
        assert.ok(json.version);
        assert.ok(json.description);
    });
    it("should create a slug", () => {
        const slug = ApplicationService.getApplicationSlug();
        assert.strictEqual("aerofly-startgeraet", slug);
    });
});
