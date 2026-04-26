import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFlightFallback } from "../../data/AeroflyFlightFallback.js";
import { MetarToAeroflyFlightConverter } from "./MetarToAeroflyFlightConverter.js";
describe("MetarToAeroflyFlightConverter", () => {
    it("should convert METAR data correctly to AeroFlight classes", () => {
        const flight = new AeroflyFlightFallback();
        // @see https://journal.3960.org/posts/2020-02-10-sabine-flughafen-amsterdam/
        const content = "EHAM 091725Z 20037G51KT 170V230 9999 FEW011 BKN014 BKN025 11/11 Q0986 RE/RA TEMPO 7000";
        const parser = new MetarToAeroflyFlightConverter();
        parser.convert(content, flight);
        assert.strictEqual(3, flight.clouds.length);
        assert.strictEqual(37, flight.wind.speed_kts);
        assert.strictEqual(51, flight.wind.gust_kts);
    });
});
