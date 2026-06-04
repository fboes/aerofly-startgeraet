import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { AeroflyFlightToMetarConverter } from "./AeroflyFlightToMetarConverter.js";
import { AeroflySettingsCloud } from "@fboes/aerofly-custom-missions";

describe("AeroflyFlightToMetarConverter", () => {
    it("should do a conversion", () => {
        const flight = new AeroflyFlightFallback(true);
        flight.timeUtc.timeDay = 4;
        flight.timeUtc.timeHours = 7.5;
        flight.wind.speed_kts = 10;
        flight.wind.directionInDegree = 0;
        flight.clouds = [
            AeroflySettingsCloud.createInFeet(0.5, 1000),
            AeroflySettingsCloud.createInFeet(0.6, 2000),
            AeroflySettingsCloud.createInFeet(0.9, 1500),
        ];

        const exporter = new AeroflyFlightToMetarConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        assert.equal(exportString, "METAR KEYW 040730Z 00010KT 9999 SCT010 BKN020 OVC015 14/04 Q1013");
    });

    it("should do a conversion with gusts", () => {
        const flight = new AeroflyFlightFallback(true);
        flight.timeUtc.timeDay = 4;
        flight.timeUtc.timeHours = 7.5;
        flight.wind.speed_kts = 10;
        flight.wind.directionInDegree = 350;
        flight.wind.gust_kts = 15;
        flight.visibility_sm = 9;
        flight.wind.temperature_celsius = 21;
        flight.clouds = [
            AeroflySettingsCloud.createInFeet(0.5, 1000),
            AeroflySettingsCloud.createInFeet(0.6, 2000),
            AeroflySettingsCloud.createInFeet(0.9, 1500),
        ];

        const exporter = new AeroflyFlightToMetarConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        assert.equal(exportString, "METAR KEYW 040730Z 35010G15KT 9SM SCT010 BKN020 OVC015 21/11 Q1013");
        //console.log(exportString);
    });
});
