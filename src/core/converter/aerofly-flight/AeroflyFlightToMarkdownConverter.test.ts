import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { AeroflyFlightToMarkdownConverter } from "./AeroflyFlightToMarkdownConverter.js";
import { AeroflySettingsCloud } from "@fboes/aerofly-custom-missions";

describe("AeroflyFlightToMarkdownConverter", () => {
    it("should do a conversion", () => {
        const flight = new AeroflyFlightFallback(true);
        flight.fuelLoadSetting.fuelMass = 50;
        flight.fuelLoadSetting.payloadMass = 90;
        flight.wind.speed_kts = 10;
        flight.wind.directionInDegree = 0;
        flight.clouds = [
            AeroflySettingsCloud.createInFeet(0.5, 1000),
            AeroflySettingsCloud.createInFeet(0.6, 2000),
            AeroflySettingsCloud.createInFeet(0.9, 1500),
        ];

        const exporter = new AeroflyFlightToMarkdownConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        //console.log(exportString);
    });
});
