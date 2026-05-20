import { describe, it } from "node:test";
import assert from "node:assert";
import * as AeroflyFlightMcpResourceService from "./AeroflyFlightMcpResourceService.js";
describe("AeroflyFlightMcpResourceService", () => {
    it("should find aircraft", () => {
        const aircraft = AeroflyFlightMcpResourceService.searchAircraft();
        assert.ok(aircraft.length > 25);
    });
    it("should find Boeing", () => {
        const aircraft = AeroflyFlightMcpResourceService.searchAircraft({ query: "Boeing" });
        assert.ok(aircraft.length > 5);
    });
    it("should find Lufthansa", () => {
        const aircraft = AeroflyFlightMcpResourceService.searchAircraft({ query: "Lufthansa" });
        assert.ok(aircraft.length > 5);
    });
    it("should find airports by coordinates", () => {
        const airports = AeroflyFlightMcpResourceService.searchAirports({
            geoQuery: {
                longitude: 13.405,
                latitude: 52.52,
                radiusKm: 100,
            },
        });
        assert.ok(airports.length > 0);
    });
});
