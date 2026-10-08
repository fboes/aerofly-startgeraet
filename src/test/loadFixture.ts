import fs from "node:fs";
import path from "node:path";

const DIR_ROOT = path.join(import.meta.dirname, "../..");

export const DIR_FIXTURE = path.join(DIR_ROOT, "src/test/fixtures");

export const DIR_ARTIFACT = path.join(DIR_ROOT, "artifacts/tests");

export function loadFixture(filename: string): string {
    return fs.readFileSync(path.join(DIR_FIXTURE, filename), "utf-8");
}

export function writeArtifact(filename: string, content: string) {
    fs.mkdirSync(DIR_ARTIFACT, { recursive: true });
    fs.writeFileSync(path.join(DIR_ARTIFACT, filename), content, "utf-8");
}
