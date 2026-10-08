import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AeroflyFlightToGeoJsonConverter } from "./AeroflyFlightToGeoJsonConverter.js";
import { AeroflyFlightFixture } from "../../../test/fixtures/AeroflyFlightFixture.js";
import { writeArtifact } from "../../../test/loadFixture.js";

describe("AeroflyFlightToGeoJsonConverter", () => {
    it("should do a conversion", () => {
        const flight = new AeroflyFlightFixture();
        const exporter = new AeroflyFlightToGeoJsonConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        writeArtifact("test.geojson", exportString);

        const json = JSON.parse(exportString);
        assert.ok(json);
        assert.equal(json.type, "FeatureCollection");
        assert.equal(
            json.features.length,
            flight.navigation.waypoints.length + 2,
            "There should be one feature for each waypoint, plus one for the flightplan line and one for the aircraft position",
        );
        assert.equal(json.features[0].geometry.type, "Point");
        assert.equal(json.features[json.features.length - 2].geometry.type, "LineString");
    });
});
