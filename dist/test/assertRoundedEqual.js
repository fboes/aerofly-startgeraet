import assert from "node:assert";
/**
 * Asserts that two numbers are equal when rounded to a specified precision.
 */
export function assertRoundedEqual(value, expected, precision = 5, message) {
    if (value === undefined) {
        throw new Error("Value is undefined");
    }
    const factor = Math.pow(10, precision);
    const roundedValue = Math.round(value * factor) / factor;
    const roundedExpected = Math.round(expected * factor) / factor;
    assert.strictEqual(roundedValue, roundedExpected, message ||
        `Expected ${roundedValue} to be equal to ${roundedExpected} when rounded to ${precision} decimal places.`);
}
