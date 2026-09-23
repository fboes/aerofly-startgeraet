import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AeroflyFlightToMetarConverter } from "./AeroflyFlightToMetarConverter.js";
import { AeroflySettingsCloud } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";

function basicFlight() {
    const flight = new AeroflyFlightFallback();
    flight.timeUtc.timeDay = 4;
    flight.timeUtc.timeHours = 7.5;
    return flight;
}

describe("AeroflyFlightToMetarConverter", () => {
    it("should do a conversion with meters, including correct rounding", () => {
        const flight = basicFlight();
        flight.wind.speed_kts = 10;
        flight.wind.directionInDegree = 0;
        flight.visibility_meter = 8020;
        flight.clouds = [
            AeroflySettingsCloud.createInFeet(0.5, 1000),
            AeroflySettingsCloud.createInFeet(0.6, 2000),
            AeroflySettingsCloud.createInFeet(0.9, 1500),
        ];

        const exporter = new AeroflyFlightToMetarConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        assert.equal(exportString, "METAR KEYW 040730Z 00010KT 8000 SCT010 BKN020 OVC015 14/04 Q1013");
        //console.log(exportString);
    });

    it("should do a conversion with gusts and statute miles", () => {
        const flight = basicFlight();
        flight.wind.speed_kts = 10;
        flight.wind.directionInDegree = 350;
        flight.wind.gust_kts = 15;
        flight.visibility_sm = 5;
        flight.wind.temperature_celsius = 21;
        flight.clouds = [
            AeroflySettingsCloud.createInFeet(0.5, 1000),
            AeroflySettingsCloud.createInFeet(0.6, 2000),
            AeroflySettingsCloud.createInFeet(0.9, 1500),
        ];

        const exporter = new AeroflyFlightToMetarConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        assert.equal(exportString, "METAR KEYW 040730Z 35010G15KT 5SM SCT010 BKN020 OVC015 21/11 Q1013");
        //console.log(exportString);
    });

    it("should do a conversion with 1/4 statute miles", () => {
        const flight = basicFlight();
        flight.visibility_sm = 5.25;

        const exporter = new AeroflyFlightToMetarConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        assert.equal(exportString, "METAR KEYW 040730Z 00000KT 5 1/4SM CLR 14/04 Q1013");
        //console.log(exportString);
    });

    it("should do a conversion with 1/2 statute miles", () => {
        const flight = basicFlight();
        flight.visibility_sm = 5.5;

        const exporter = new AeroflyFlightToMetarConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        assert.equal(exportString, "METAR KEYW 040730Z 00000KT 5 1/2SM CLR 14/04 Q1013");
        //console.log(exportString);
    });

    it("should do a conversion with 3/4 statute miles", () => {
        const flight = basicFlight();
        flight.visibility_sm = 5.75;

        const exporter = new AeroflyFlightToMetarConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        assert.equal(exportString, "METAR KEYW 040730Z 00000KT 5 3/4SM CLR 14/04 Q1013");
        //console.log(exportString);
    });

    it("should do a conversion with exact 3/4 statute miles", () => {
        const flight = basicFlight();
        flight.visibility_sm = 0.75;

        const exporter = new AeroflyFlightToMetarConverter();
        const exportString = exporter.convert(flight);

        assert.ok(exportString);
        assert.equal(exportString, "METAR KEYW 040730Z 00000KT 3/4SM CLR 14/04 Q1013");
        //console.log(exportString);
    });
});
