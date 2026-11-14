import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { isRecommendedAircraft, isUnrecommendedAircraft } from "./recommendedAircraft.js";
import { findAeroflyAircraft } from "../../core/services/getAeroflyAircraft.js";

const aircraftC172 = findAeroflyAircraft("c172");
const aircraftEc1135 = findAeroflyAircraft("ec135");
if (!aircraftC172 || !aircraftEc1135) {
    throw new Error("Fixure aircraft missing");
}

describe("recommendedAircraft", (): void => {
    it("lets unrestricted manifests pass always", () => {
        const manifest = {
            name: "",
            displayName: "",
            description: "",
            longDescription: "",
            version: "",
        };

        assert.ok(isRecommendedAircraft(manifest, aircraftC172), "Without recommendation, every aircraft fits");
        assert.ok(!isUnrecommendedAircraft(manifest, aircraftC172), "Without restrictions, every aircraft fits");

        assert.ok(isRecommendedAircraft(manifest, aircraftEc1135), "Without recommendation, every aircraft fits");
        assert.ok(!isUnrecommendedAircraft(manifest, aircraftEc1135), "Without restrictions, every aircraft fits");
    });

    it("filters aicraft by allow lists", () => {
        const manifest = {
            name: "",
            displayName: "",
            description: "",
            longDescription: "",
            version: "",
            recommendedAircraft: ["helicopter"],
        };

        assert.ok(!isRecommendedAircraft(manifest, aircraftC172), "With recommendation, only helicopters fit");
        assert.ok(!isUnrecommendedAircraft(manifest, aircraftC172), "Without restrictions, every aircraft fits");

        assert.ok(isRecommendedAircraft(manifest, aircraftEc1135), "With recommendation, only helicopters fit");
        assert.ok(!isUnrecommendedAircraft(manifest, aircraftEc1135), "Without restrictions, every aircraft fits");
    });

    it("filters aicraft by block lists", () => {
        const manifest = {
            name: "",
            displayName: "",
            description: "",
            longDescription: "",
            version: "",
            unrecommendedAircraft: ["helicopter"],
        };

        assert.ok(isRecommendedAircraft(manifest, aircraftC172), "Without recommendation, every aircraft fits");
        assert.ok(!isUnrecommendedAircraft(manifest, aircraftC172), "With restrictions, helicopters are unrecommended");

        assert.ok(isRecommendedAircraft(manifest, aircraftEc1135), "Without recommendation, every aircraft fits");
        assert.ok(
            isUnrecommendedAircraft(manifest, aircraftEc1135),
            "With restrictions, helicopters are unrecommended",
        );
    });
});
