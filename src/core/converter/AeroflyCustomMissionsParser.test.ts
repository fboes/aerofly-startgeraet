import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import { AeroflyCustomMissionsParser } from "./AeroflyCustomMissionsParser.js";

describe("AeroflyCustomMissionsParser", () => {
  it("should convert TMC files into AeroflyFlight classes", () => {
    const content = fs.readFileSync("./src/test/fixtures/custom_missions_user.tmc", "utf-8");

    const parser = new AeroflyCustomMissionsParser();
    const flight = parser.parse(content);

    assert.strictEqual(flight.aircraft.name, "c172");
    assert.strictEqual(flight.fuelLoadSetting.fuelMass, 80, "Reads values, eveb if commented out");
    assert.strictEqual(flight.fuelLoadSetting.payloadMass, 90);

    //console.log(flight);
  });
});
