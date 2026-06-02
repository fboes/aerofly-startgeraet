import { describe, it } from "node:test";
import assert from "node:assert";
import { markdownTable } from "./markdownTable.js";

describe("markdownTable", () => {
    it("should build a well formatted table", () => {
        const markdownTableOuput = markdownTable([
            ["Departure", "Duration", "Flight distance"],
            ["---", "--:", "--:"],
            ["EHAM", `${24} min`, `${56} km`],
        ]);

        assert.ok(markdownTableOuput);
        console.log(markdownTableOuput);
    });

    it("should build a well formatted table with mssing table cells", () => {
        const markdownTableOuput = markdownTable([
            [`No`, `Local date¹`, `Local time¹`, `Wind`, `Clouds`, `Visibility`, `Runway`, `Aircraft position`],
            [`:-:`, `-----------`, `----------:`, `:--:`, `---`, `--:`, `---`, `---`],
            ...[1, 2, 3].map((index) => {
                return ["#" + String(index), "2024-05-19", "10:00", "N"];
            }),
        ]);

        assert.ok(markdownTableOuput);
        console.log(markdownTableOuput);
    });
});
