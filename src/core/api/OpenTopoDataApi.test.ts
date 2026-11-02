import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";

import { fetchOpenTopoData } from "./OpenTopoDataApi.js";
import type { OpenTopoDataApiCoordinates } from "./OpenTopoDataApi.type.js";

const includeApiTests = process.env.INCLUDE_API_TESTS === "1";

await describe("OpenTopoDataApi", { skip: !includeApiTests }, async (): Promise<void> => {
    await it("fetches Open Topo API elevation data", async () => {
        const coordinates: OpenTopoDataApiCoordinates[] = [
            {
                lat: 56.0,
                lng: 123.0,
            },
            {
                lat: 51.5897,
                lng: 9.92222,
            },
        ];

        const topoData = await fetchOpenTopoData(coordinates);

        assert.strictEqual(topoData.status, "OK");
        assert.strictEqual(topoData.results.length, 2);
        assert.ok(topoData.results[0]?.elevation !== null);
        assert.ok(topoData.results[1]?.elevation !== null);

        //console.log(topoData.results);
    });
});
