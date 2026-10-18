import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { getWaypointData } from "./Waypoint.js";

const includeApiTests = process.env.INCLUDE_API_TESTS === "1";

await describe("Waypoint", { skip: !includeApiTests }, async (): Promise<void> => {
    await it("does find waypoints by IDs", async () => {
        const testCases = ["KMCI", "MCI", "BARBQ"];

        for (const testCase of testCases) {
            const wp = await getWaypointData(testCase);
            assert.strictEqual(wp?.identifier, testCase);

            const wp2 = await getWaypointData(testCase);
            assert.strictEqual(wp2?.identifier, testCase);
        }
    });
});
