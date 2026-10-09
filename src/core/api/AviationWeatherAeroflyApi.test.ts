import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { getAirportCached, getBestRunway } from "./AviationWeatherAeroflyApi.js";

const includeApiTests = process.env.INCLUDE_API_TESTS === "1";

await describe("AviationWeatherAeroflyApi", { skip: !includeApiTests }, async (): Promise<void> => {
    await it("fetches airports by ICAO code (also using cache)", async () => {
        const airport = await getAirportCached("KEYW");
        assert.ok(airport);
        assert.strictEqual(airport.icaoId, "KEYW");

        const airport2 = await getAirportCached("KEYW");
        assert.ok(airport2);
        assert.strictEqual(airport2.icaoId, "KEYW");
    });

    await it("selects the best runway", async () => {
        const airport = await getAirportCached("KEYW");
        assert.ok(airport.runways.length > 0, "Runways need to be present");

        const testcases: [number, string][] = [
            [90, "09"],
            [30, "09"],
            [215, "27"]
        ];
        testcases.forEach(async (r) => {
            const runway = await getBestRunway("KEYW", r[0], 10);
            assert.ok(runway, "The best runway should be found");
            assert.strictEqual(runway.id, r[1], "The best runway should be " + r[1] + " for wind direction " + r[0].toFixed(0));
        });
    });
});
