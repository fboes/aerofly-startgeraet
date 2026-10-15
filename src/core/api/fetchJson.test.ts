import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { fetchJson, handleJsonResponse } from "./fetchJson.js";

const includeApiTests = process.env.INCLUDE_API_TESTS === "1";

await describe("fetchJson", { skip: !includeApiTests }, async (): Promise<void> => {
    await it("fetches JSON data and handles the output", async () => {
        const response = await fetchJson("https://jsonplaceholder.typicode.com/posts/1");
        const json = await handleJsonResponse(response);

        assert.ok(json);
    });
});
