import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SkyVectorUrl } from "./SkyVectorUrl.js";
import { AeroflyFlightFixture } from "../../test/fixtures/AeroflyFlightFixture.js";

describe("SkyVectorUrl", () => {
    it("should convert a flight plan into a SkyVector URL", () => {
        const flight = new AeroflyFlightFixture();
        assert.strictEqual(flight.navigation.cruiseAltitude_ft, 8000);

        const url = new SkyVectorUrl(flight);
        //console.log(url.toURL())

        const urlUrl = url.getRouteURL(250);
        const urlString = urlUrl.toString();

        assert.ok(urlString.includes("https://skyvector.com/?ll="));
        assert.ok(urlString.includes("chart=301"));
        assert.ok(urlString.includes("zoom=3"));
        assert.ok(urlString.includes("fpl=N0250A080"));

        assert.strictEqual(urlUrl.origin, "https://skyvector.com");
        assert.strictEqual(urlUrl.pathname, "/");
        const params = urlUrl.searchParams;
        assert.strictEqual(params.get("chart"), "301");
        assert.strictEqual(params.get("zoom"), "3");
        assert.ok(params.get("fpl")?.startsWith("N0250A080"));
    });

    it("outputs origin and destination SkyVector URLs", () => {
        const flight = new AeroflyFlightFixture();
        const url = new SkyVectorUrl(flight);

        const originString = url.getOriginURL().toString();
        assert.ok(originString.includes("https://skyvector.com/"));
        assert.ok(originString.includes("KEYW"));

        const destinationString = url.getDestinationURL().toString();
        assert.ok(destinationString.includes("https://skyvector.com/"));
        assert.ok(destinationString.includes("KMIA"));
    });

    it("also needs to output SkyVector URLs empty flight plans", () => {
        const flight = new AeroflyFlightFixture();
        flight.clearWaypoints();
        assert.strictEqual(flight.navigation.waypoints.length, 0);

        const url = new SkyVectorUrl(flight);
        const urlString = url.getRouteURL(250).toString();

        assert.ok(urlString.includes("https://skyvector.com/"), "URL should be there, even though it may be empty");
    });

    it("outputs origin and destination SkyVector URLs for empty flight plans", () => {
        const flight = new AeroflyFlightFixture();
        flight.clearWaypoints();
        assert.strictEqual(flight.navigation.waypoints.length, 0);

        const url = new SkyVectorUrl(flight);

        const originString = url.getOriginURL().toString();
        assert.ok(originString.includes("https://skyvector.com/"));

        const destinationString = url.getDestinationURL().toString();
        assert.ok(destinationString.includes("https://skyvector.com/"));
    });
});
