import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { cardinalDirection, asVectorString } from "./getVectorString.js";
import { Vector } from "@fboes/geojson";
import { UNIT_METER_PER_NM } from "../util/units.js";

describe("getVectorString", () => {
    it("provides cardinal directions", () => {
        assert.strictEqual("north", cardinalDirection(0));
        assert.strictEqual("north", cardinalDirection(10));
        assert.strictEqual("north", cardinalDirection(22));
        assert.strictEqual("north-east", cardinalDirection(23));
        assert.strictEqual("north-east", cardinalDirection(24));
        assert.strictEqual("north-east", cardinalDirection(45));
        assert.strictEqual("north-east", cardinalDirection(46));
        assert.strictEqual("east", cardinalDirection(90));
        assert.strictEqual("north", cardinalDirection(359));
    });

    it("provides vector strings", () => {
        assert.strictEqual(asVectorString(new Vector(0 * UNIT_METER_PER_NM, 45), "on site"), `on site`);
        assert.strictEqual(asVectorString(new Vector(2 * UNIT_METER_PER_NM, 0)), `2 NM to the north`);
        assert.strictEqual(asVectorString(new Vector(5.5 * UNIT_METER_PER_NM, 90)), `5.5 NM to the east`);
        assert.strictEqual(asVectorString(new Vector(10.5 * UNIT_METER_PER_NM, 180)), `11 NM to the south`);
    });
});
