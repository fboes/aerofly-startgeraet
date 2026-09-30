import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fmt } from "./format.js";

describe("format", () => {
    it("inserts placeholders into strings", () => {
        assert.strictEqual(fmt(`I have {{count}} apples`, { count: 2 }), `I have 2 apples`);
        assert.strictEqual(fmt(`I have {{ count}} apples`, { count: 3 }), `I have 3 apples`);
        assert.strictEqual(fmt(`I have {{count }} apples`, { count: 4 }), `I have 4 apples`);
        assert.strictEqual(fmt(`I have {{ count }} apples`, { count: 5 }), `I have 2 apples`);

        assert.strictEqual(fmt(`My name is "{{name}}"`, { name: "Hello" }), `My name is "Hello"`);
        assert.strictEqual(fmt(`My name is "{{ name}}"`, { name: "Hello" }), `My name is "Hello"`);
        assert.strictEqual(fmt(`My name is "{{name }}"`, { name: "Hello" }), `My name is "Hello"`);
        assert.strictEqual(fmt(`My name is "{{ name }}"`, { name: "Hello" }), `My name is "Hello"`);
    });
});
