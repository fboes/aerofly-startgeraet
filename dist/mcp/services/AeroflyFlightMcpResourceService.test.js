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
});
