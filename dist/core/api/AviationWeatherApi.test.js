import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { AviationWeatherApi } from "./AviationWeatherApi.js";
await describe("AviationWeatherApi", async () => {
    await it("should fetch airports correctly", async () => {
        const icaoCodes = ["KEYW", "KMCI", "KMVY", "KCCR"];
        const airports = await AviationWeatherApi.fetchAirports(icaoCodes);
        //console.log(airports);
        assert.strictEqual(airports.length, icaoCodes.length);
        airports.forEach((airportNormalized) => {
            assert.strictEqual(typeof airportNormalized.icaoId, "string", "airportNormalized.icaoId");
            assert.ok(icaoCodes.indexOf(airportNormalized.icaoId) > -1);
            assert.strictEqual(typeof airportNormalized.name, "string", "airportNormalized.name");
            assert.strictEqual(typeof airportNormalized.type, "string", "airportNormalized.type");
            assert.strictEqual(typeof airportNormalized.lat, "number", "airportNormalized.lat");
            assert.strictEqual(typeof airportNormalized.lon, "number", "airportNormalized.lon");
            assert.strictEqual(typeof airportNormalized.elev, "number", "airportNormalized.elev");
            assert.strictEqual(typeof airportNormalized.magdec, "number", "airportNormalized.magdec");
            assert.strictEqual(typeof airportNormalized.rwyNum, "string", "airportNormalized.rwyNum");
            assert.strictEqual(typeof airportNormalized.tower, "boolean", "airportNormalized.tower");
            assert.strictEqual(typeof airportNormalized.beacon, "boolean", "airportNormalized.beacon");
            assert.ok(Array.isArray(airportNormalized.runways), "airportNormalized.runways");
            assert.ok(Array.isArray(airportNormalized.freqs), "airportNormalized.freqs");
        });
    });
    await it("should fetch metar correctly", async () => {
        const metars = await AviationWeatherApi.fetchMetar(["KEYw"]);
        assert.strictEqual(metars.length, 1);
        metars.forEach((metar) => {
            assert.strictEqual(typeof metar.lat, "number", "metar.lat");
            assert.strictEqual(typeof metar.lon, "number", "metar.lon");
            assert.strictEqual(typeof metar.elev, "number", "metar.elev");
        });
    });
    await it("should fetch navaids correctly", async () => {
        const navaids = await AviationWeatherApi.fetchNavaids(["MCI"]);
        assert.ok(Array.isArray(navaids), "navaids is an array");
        assert.ok(navaids.length > 0, "navaids array is not empty");
        navaids.forEach((navaid) => {
            assert.strictEqual(typeof navaid.id, "string", "navaid.id");
            assert.strictEqual(typeof navaid.type, "string", "navaid.type");
        });
    });
    await it("should fetch navaids by position correctly", async () => {
        const navaids = await AviationWeatherApi.fetchNavaidsByPosition(-94.7371, 39.2853, 10000);
        assert.ok(Array.isArray(navaids), "navaids is an array");
        assert.ok(navaids.length > 0, "navaids array is not empty");
        navaids.forEach((navaid) => {
            assert.strictEqual(typeof navaid.id, "string", "navaid.id");
            assert.strictEqual(typeof navaid.type, "string", "navaid.type");
        });
    });
    await it("should fetch metar by position correctly", async () => {
        const metars = await AviationWeatherApi.fetchMetarByPosition(-94.7371, 39.2853, 10000);
        assert.ok(Array.isArray(metars), "metars is an array");
        /*assert.ok(metars.length > 0, "metars array is not empty");

    metars.forEach((metar) => {
      assert.strictEqual(typeof metar.lat, "number", "metar.lat");
      assert.strictEqual(typeof metar.lon, "number", "metar.lon");
      assert.strictEqual(typeof metar.elev, "number", "metar.elev");
    });*/
    });
});
