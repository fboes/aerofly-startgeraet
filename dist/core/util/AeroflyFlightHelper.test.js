import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "./AeroflyFlightFallback.js";
import { AeroflySettingsCloud } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightHelper } from "./AeroflyFlightHelper.js";
describe("AeroflyFlightHelper", () => {
    it("should find the correct ceiling", () => {
        const aeroflyFlight = new AeroflyFlightFallback();
        // Unordered clouds
        aeroflyFlight.clouds = [
            AeroflySettingsCloud.createInFeet(0.5, 1000),
            AeroflySettingsCloud.createInFeet(0.6, 2000),
            AeroflySettingsCloud.createInFeet(0.9, 1500),
        ];
        assert.strictEqual("SCT", aeroflyFlight.clouds[0].density_code);
        assert.strictEqual("BKN", aeroflyFlight.clouds[1].density_code);
        assert.strictEqual("OVC", aeroflyFlight.clouds[2].density_code);
        assert.strictEqual(aeroflyFlight.clouds[1], AeroflyFlightHelper.getCeiling(aeroflyFlight), "Disregard first cloud because not enough coverage, use third as being the lowest");
    });
});
