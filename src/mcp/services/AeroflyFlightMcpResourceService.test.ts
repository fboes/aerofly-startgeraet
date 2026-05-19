import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightMcpResourceService } from "./AeroflyFlightMcpResourceService.js";

describe("AeroflyFlightMcpResourceService", () => {
    it("should find aircraft", () => {
        const service = new AeroflyFlightMcpResourceService();
        const aircraft = service.searchAircraft();

        assert.ok(aircraft.length > 25);
    });

    it("should find Boeing", () => {
        const service = new AeroflyFlightMcpResourceService();
        const aircraft = service.searchAircraft({ query: "Boeing" });

        assert.ok(aircraft.length > 5);
    });

    it("should find Lufthansa", () => {
        const service = new AeroflyFlightMcpResourceService();
        const aircraft = service.searchAircraft({ query: "Lufthansa" });

        assert.ok(aircraft.length > 5);
    });

    it("should find airports by coordinates", () => {
        const service = new AeroflyFlightMcpResourceService();
        const airports = service.searchAirports({
            geoQuery: {
                longitude: 13.405,
                latitude: 52.52,
                radiusKm: 100,
            },
        });

        assert.ok(airports.length > 0);
    });
});
