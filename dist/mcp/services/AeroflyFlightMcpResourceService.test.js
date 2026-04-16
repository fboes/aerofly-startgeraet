import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightMcpResourceService } from "./AeroflyFlightMcpResourceService.js";
import { AeroflyAircraftService } from "../../core/services/AeroflyAircraftService.js";
import { AeroflyAirportService } from "../../core/services/AeroflyAirportService.js";
describe("AeroflyFlightMcpResourceService", () => {
    const aircraftService = new AeroflyAircraftService();
    const airportService = new AeroflyAirportService();
    it("should find aircraft", () => {
        const service = new AeroflyFlightMcpResourceService(aircraftService, airportService);
        const aircraft = service.searchAircraft();
        assert.ok(aircraft.length > 25);
    });
    it("should find Boeing", () => {
        const service = new AeroflyFlightMcpResourceService(aircraftService, airportService);
        const aircraft = service.searchAircraft({ query: "Boeing" });
        assert.ok(aircraft.length > 5);
    });
    it("should find Lufthansa", () => {
        const service = new AeroflyFlightMcpResourceService(aircraftService, airportService);
        const aircraft = service.searchAircraft({ query: "Lufthansa" });
        assert.ok(aircraft.length > 5);
    });
    it("should find airports by coordinates", () => {
        const service = new AeroflyFlightMcpResourceService(aircraftService, airportService);
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
