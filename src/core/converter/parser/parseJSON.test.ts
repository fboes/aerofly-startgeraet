import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { asJSONArray, asJSONNumber, asJSONObject, asJSONString } from "./parseJSON.js";

describe("parseJSON", () => {
    it("parse unknown JSON structure", () => {
        assert.strictEqual(0, asJSONNumber(0));
        assert.strictEqual(2, asJSONNumber(2));
        assert.strictEqual(2.2, asJSONNumber(2.2));

        assert.strictEqual("", asJSONString(""));
        assert.strictEqual("a", asJSONString("a"));
        assert.strictEqual("2", asJSONString("2"));

        assert.ok(asJSONArray([]));
        assert.ok(asJSONArray(["2"]));

        assert.ok(asJSONObject({}));
        assert.ok(asJSONObject({ a: "2" }));
    });

    it("throws Error on unexpected JSON structure", () => {
        assert.throws(() => {
            asJSONNumber("a");
        });
        assert.throws(() => {
            asJSONString([]);
        });
        assert.throws(() => {
            asJSONArray("a");
        });
        assert.throws(() => {
            asJSONObject("a");
        });
    });
});
