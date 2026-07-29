import { describe, it } from "node:test";
import assert from "node:assert";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
class Test extends StringToAeroflyFlightConverter {
    convert(content, flightplan, index = 0) {
        if (!content || !flightplan || index < 0) {
            throw new Error("Missing input");
        }
    }
}
describe("StringToAeroflyFlightConverter", () => {
    it("should find broken number conversions", () => {
        const t = new Test();
        assert.strictEqual(t.parseNumberOrError("0"), 0);
        assert.strictEqual(t.parseNumberOrError("0100"), 100);
        assert.strictEqual(t.parseNumberOrError("10.01"), 10.01);
        try {
            assert.strictEqual(t.parseNumberOrError("abc"), 0);
        }
        catch (e) {
            assert.ok(e instanceof Error);
        }
    });
});
