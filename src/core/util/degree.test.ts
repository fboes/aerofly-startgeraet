import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { degreeDifference, degreeNormalize, degreeToRad } from "./degree.js";

describe("degree", () => {
    it("normalizes degrees", () => {
        assert.strictEqual(degreeNormalize(0), 0);
        assert.strictEqual(degreeNormalize(-1), 359);
        assert.strictEqual(degreeNormalize(360), 0);
        assert.strictEqual(degreeNormalize(45), 45);
        assert.strictEqual(degreeNormalize(270), 270);

        assert.strictEqual(233, degreeNormalize(233));
        assert.strictEqual(358, degreeNormalize(-2));
        assert.strictEqual(6, degreeNormalize(366));
        assert.strictEqual(0, degreeNormalize(-360));
    });

    it("should convert degrees to radians correctly", () => {
        assert.strictEqual(Math.PI, degreeToRad(180));
        assert.strictEqual((1 / 2) * Math.PI, degreeToRad(90));
        assert.strictEqual((1 / 4) * Math.PI, degreeToRad(45));
        assert.strictEqual(Math.PI / 180, degreeToRad(1));
    });

    it("caclultes degree difference", () => {
        assert.strictEqual(90, degreeDifference(0, 90));
        assert.strictEqual(180, degreeDifference(0, 180));
        assert.strictEqual(-90, degreeDifference(90, 0));
        assert.strictEqual(-180, degreeDifference(180, 0));
        assert.strictEqual(-179, degreeDifference(179, 0));

        assert.strictEqual(90, degreeDifference(270, 0));
        assert.strictEqual(-90, degreeDifference(0, 270));
    });
});
