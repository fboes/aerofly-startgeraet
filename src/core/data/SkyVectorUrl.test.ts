import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "./AeroflyFlightFallback.js";
import { SkyVectorUrl } from "./SkyVectorUrl.js";

describe("SkyVectorUrl", () => {
    it("should convert a flight plan into a SkyVector URL", () => {
        const flight = new AeroflyFlightFallback(true);
        flight.navigation.cruiseAltitude_ft = 15_000;

        const url = new SkyVectorUrl(flight, 250);
        //console.log(url.toURL())

        const urlString = url.toString();
        assert.ok(urlString.includes("https://skyvector.com/?ll="));
        assert.ok(urlString.includes("chart=301"));
        assert.ok(urlString.includes("zoom=3"));
        assert.ok(urlString.includes("fpl=N0250A150"));

        const urlUrl = url.toURL();
        assert.strictEqual(urlUrl.origin, "https://skyvector.com");
        assert.strictEqual(urlUrl.pathname, "/");
        const params = urlUrl.searchParams;
        assert.strictEqual(params.get("chart"), "301");
        assert.strictEqual(params.get("zoom"), "3");
        assert.ok(params.get("fpl")?.startsWith("N0250A150"));
    });
});
