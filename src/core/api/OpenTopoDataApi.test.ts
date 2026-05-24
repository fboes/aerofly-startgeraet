import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { OpenTopoDataApi, type OpenTopoDataApiCoordinates } from "./OpenTopoDataApi.js";

await describe("OpenTopoDataApi", async (): Promise<void> => {
    await it("should fetch elevation data", async () => {
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

        const topo = new OpenTopoDataApi();
        const topoData = await topo.fetch(coordinates);

        assert.strictEqual(topoData.status, "OK");
        assert.strictEqual(topoData.results.length, 2);

        //console.log(topoData.results);
    });
});
