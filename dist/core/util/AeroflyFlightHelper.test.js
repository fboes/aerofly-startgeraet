import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "../data/AeroflyFlightFallback.js";
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
        assert.strictEqual(aeroflyFlight.clouds[2], AeroflyFlightHelper.getCeiling(aeroflyFlight), "Disregard first cloud because not enough coverage, use third as being the lowest");
    });
    it("should calculate the sun position", () => {
        const aeroflyFlight = new AeroflyFlightFallback();
        // Fix date
        aeroflyFlight.timeUtc.time = new Date("2025-06-21 12:00:00 UTC");
        assert.strictEqual(2025, aeroflyFlight.timeUtc.timeYear);
        assert.strictEqual(6, aeroflyFlight.timeUtc.timeMonth);
        assert.strictEqual(21, aeroflyFlight.timeUtc.timeDay);
        assert.strictEqual(12, aeroflyFlight.timeUtc.timeHours);
        //console.log(aeroflyFlight.timeUtc);
        const sunPosition = AeroflyFlightHelper.getSunPosition(aeroflyFlight);
        assert.strictEqual(16.6, sunPosition.elevation);
        assert.strictEqual(71.3, sunPosition.azimuth);
    });
});
