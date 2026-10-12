import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { getCardinalDirection, getVectorString } from "./getVectorString.js";
import { Vector } from "@fboes/geojson";
import { UNIT_METER_PER_NM } from "../util/units.js";

describe("getVectorString", () => {
    it("provides cardinal directions", () => {
        assert.strictEqual("north", getCardinalDirection(0));
        assert.strictEqual("north", getCardinalDirection(10));
        assert.strictEqual("north", getCardinalDirection(22));
        assert.strictEqual("north-east", getCardinalDirection(23));
        assert.strictEqual("north-east", getCardinalDirection(24));
        assert.strictEqual("north-east", getCardinalDirection(45));
        assert.strictEqual("north-east", getCardinalDirection(46));
        assert.strictEqual("east", getCardinalDirection(90));
        assert.strictEqual("north", getCardinalDirection(359));
    });

    it("provides vector strings", () => {
        assert.strictEqual(getVectorString(new Vector(0 * UNIT_METER_PER_NM, 45), "on site"), `on site`);
        assert.strictEqual(getVectorString(new Vector(2 * UNIT_METER_PER_NM, 0)), `2 NM to the north`);
        assert.strictEqual(getVectorString(new Vector(5.5 * UNIT_METER_PER_NM, 90)), `5.5 NM to the east`);
        assert.strictEqual(getVectorString(new Vector(10.5 * UNIT_METER_PER_NM, 180)), `11 NM to the south`);
    });
});
