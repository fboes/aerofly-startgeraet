import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { getLocationData } from "./Location.js";

const includeApiTests = process.env.INCLUDE_API_TESTS === "1";

await describe("Location", { skip: !includeApiTests }, async (): Promise<void> => {
    await it("does find locations by ICAO identifiers", async () => {
        const testCases = ["KMCI", "MCI", "BARBQ"];

        for (const testCase of testCases) {
            const wp = await getLocationData(testCase);
            assert.strictEqual(wp?.identifier, testCase);

            const wp2 = await getLocationData(testCase);
            assert.strictEqual(wp2?.identifier, testCase);
        }
    });
});
