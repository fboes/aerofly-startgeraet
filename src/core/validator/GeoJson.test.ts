import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadFixture } from "../../test/loadFixture.js";
import { parseGeoJson } from "./GeoJson.js";

describe("GeoJson", () => {
    it("validates GeoJSON", () => {
        const content = loadFixture("EGOV-EGOV.geojson");
        const geoJson = parseGeoJson(JSON.parse(content));

        assert.ok(geoJson);
    });
});
