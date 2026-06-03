import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "../data/AeroflyFlightFallback.js";
import { AeroflySettingsCloud } from "@fboes/aerofly-custom-missions";
import { getSunPositionName, getClouds, getFlightplanWaypoints } from "./AeroflyFlightFormatter.js";

describe("AeroflyFlightFormatter", () => {
    it("should calculate the sun position", () => {
        const aeroflyFlight = new AeroflyFlightFallback();

        for (const testCase of <[string, string][]>[
            ["2026-06-21 12:00:00 UTC", "Day"],
            ["2026-06-21 18:00:00 UTC", "Day"],
            ["2026-06-21 23:00:00 UTC", "Day"],
            ["2026-06-22 00:30:00 UTC", "Dawn"],
            ["2026-06-22 06:00:00 UTC", "Night"],
        ]) {
            aeroflyFlight.timeUtc.time = new Date(testCase[0]);

            assert.strictEqual(testCase[1], getSunPositionName(aeroflyFlight));
        }
    });

    it("should display clouds correctly", () => {
        const aeroflyFlight = new AeroflyFlightFallback();
        aeroflyFlight.clouds = [
            new AeroflySettingsCloud(0.125, 0.11),
            new AeroflySettingsCloud(0.625, 0.14),
            new AeroflySettingsCloud(0.625, 0.25),
        ];

        const string = getClouds(aeroflyFlight);
        assert.strictEqual("FEW @ 1,100ft | BKN @ 1,400ft | BKN @ 2,500ft", string);
    });

    it("should shorten flightplans correctly", () => {
        const aeroflyFlight = new AeroflyFlightFallback(true);
        assert.strictEqual(aeroflyFlight.navigation.waypoints.length, 5);

        for (const testCase of <[number, string][]>[
            [0, "KEYW → KMTH → MNATE → HST → KMIA"],
            [1, "KEYW → KMTH → MNATE → HST → KMIA"],
            [2, "KEYW → KMIA"],
            [3, "KEYW → … → KMIA"],
            [4, "KEYW → … → HST → KMIA"],
            [5, "KEYW → KMTH → MNATE → HST → KMIA"],
        ]) {
            const string = getFlightplanWaypoints(aeroflyFlight, testCase[0]);
            assert.strictEqual(string, testCase[1]);
        }
    });
});
