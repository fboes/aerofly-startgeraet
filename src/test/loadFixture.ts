import fs from "node:fs";
import path from "node:path";

export function loadFixture(filename: string): string {
    return fs.readFileSync(path.join(getFixturePath(), filename), "utf-8");
}

export function getFixturePath(): string {
    return path.join(import.meta.dirname, "../..", "src/test/fixtures");
}
