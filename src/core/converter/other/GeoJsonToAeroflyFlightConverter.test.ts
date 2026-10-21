import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { GeoJsonToAeroflyFlightConverter } from "./GeoJsonToAeroflyFlightConverter.js";
import { loadFixture } from "../../../test/loadFixture.js";

describe("GeoJsonToAeroflyFlightConverter", () => {
    it("imports GeoJSON featuring Points", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("EGOV-EGOV.geojson");

        const parser = new GeoJsonToAeroflyFlightConverter();
        parser.convert(content, flight);

        assert.strictEqual(flight.navigation.waypoints.length, 16);
        assert.strictEqual(flight.navigation.waypoints.at(0)?.identifier, "EGOV");
        assert.strictEqual(flight.navigation.waypoints.at(-1)?.identifier, "EGOV");
    });

    it("imports GeoJSON featuring LineString", () => {
        const flight = new AeroflyFlightFallback();
        const content = loadFixture("reno-airrace.geojson");

        const parser = new GeoJsonToAeroflyFlightConverter();
        parser.convert(content, flight);

        assert.strictEqual(flight.navigation.waypoints.length, 15);
    });

    it("show options to import Points or LineStrings", () => {
        const content = loadFixture("flight-EGCC-EDDF.geojson");
        const parser = new GeoJsonToAeroflyFlightConverter();

        {
            const indices = parser.getIndices(content);
            //console.log(indices);
            assert.strictEqual(indices.length, 2);
        }

        {
            const flight = new AeroflyFlightFallback();
            parser.convert(content, flight, 0);
            assert.strictEqual(flight.navigation.waypoints.length, 17);
            assert.strictEqual(flight.navigation.waypoints.at(0)?.identifier, "EGCC");
            assert.strictEqual(flight.navigation.waypoints.at(-1)?.identifier, "EDDF");
        }

        {
            const flight2 = new AeroflyFlightFallback();
            parser.convert(content, flight2, 1);
            //console.log(flight2.navigation.waypoints)
            assert.strictEqual(flight2.navigation.waypoints.length, 18);
            assert.notStrictEqual(flight2.navigation.waypoints.at(0)?.identifier, "EGCC"); // LineString does not have identifiers
        }
    });
});
