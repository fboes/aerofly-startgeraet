import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "../util/AeroflyFlightFallback.js";
import { AeroflyFlightFormatter } from "./AeroflyFlightFormatter.js";
import { AeroflySettingsCloud } from "@fboes/aerofly-custom-missions";

describe("AeroflyFlightFormatter", () => {
    it("should calculate the sun position", () => {
        const aeroflyFlight = new AeroflyFlightFallback();

        for (const testCase of [
            ["2026-06-21 12:00:00 UTC", "Day"],
            ["2026-06-21 18:00:00 UTC", "Day"],
            ["2026-06-21 23:00:00 UTC", "Day"],
            ["2026-06-22 00:30:00 UTC", "Dawn"],
            ["2026-06-22 06:00:00 UTC", "Night"],
        ]) {
            aeroflyFlight.timeUtc.time = new Date(testCase[0]);

            assert.strictEqual(testCase[1], AeroflyFlightFormatter.getSunPositionName(aeroflyFlight));
        }
    });

    it("should display clouds correctly", () => {
        const aeroflyFlight = new AeroflyFlightFallback();
        aeroflyFlight.clouds = [
            new AeroflySettingsCloud(0.125, 0.11),
            new AeroflySettingsCloud(0.625, 0.14),
            new AeroflySettingsCloud(0.625, 0.25),
        ];

        const string = AeroflyFlightFormatter.getClouds(aeroflyFlight);
        assert.strictEqual("FEW @ 1,100ft | BKN @ 1,400ft | BKN @ 2,500ft", string);
    });
});
