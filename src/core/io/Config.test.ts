import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ConfigFixture } from "../../test/fixtures/ConfigFixture.js";

describe("Config / ConfigFixture", () => {
    it("should get configuration data as JSON", () => {
        const config = new ConfigFixture();
        const json = config.toJSON();

        //console.log(json);

        assert.strictEqual(typeof json.importDirectory, "string");
        assert.strictEqual(typeof json.fontSizePercent, "number");
        assert.strictEqual(typeof json.lastUpdateCheck, "string");
    });

    it("should handle the Date storage correctly", () => {
        const config = new ConfigFixture();
        assert.strictEqual(typeof config.lastUpdateCheck, "object", "lastUpdateCheck should return a Date");
        assert.strictEqual(typeof config.lastUpdateCheck.getDate(), "number");
        assert.strictEqual(typeof config.lastUpdateCheck.toISOString(), "string");
    });

    it("should handle getters and setters for config values", () => {
        const config = new ConfigFixture();

        config.fontSizePercent = 100;
        assert.strictEqual(config.fontSizePercent, 100);

        config.fontSizePercent = 50;
        assert.strictEqual(config.fontSizePercent, 50);
    });
});
