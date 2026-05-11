import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { OpenTopoDataApi } from "./OpenTopoDataApi.js";
await describe("OpenTopoDataApi", async () => {
    await it("should fetch elevation data", async () => {
        const coordinates = [
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
