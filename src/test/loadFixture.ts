import fs from "node:fs";
import path from "node:path";

export function loadFixture(filename: string): string {
    return fs.readFileSync(path.join(import.meta.dirname, "../..", "src/test/fixtures", filename), "utf-8");
}
