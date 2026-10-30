import fs from "node:fs";
import path from "node:path";
import { DIR_ARTIFACTS, DIR_ROOT } from "../core/util/directory.js";

export const DIR_FIXTURE = path.join(DIR_ROOT, "src/test/fixtures");
export const DIR_ARTIFACT_TESTS = path.join(DIR_ARTIFACTS, "tests");

export function loadFixture(filename: string): string {
    return fs.readFileSync(path.join(DIR_FIXTURE, filename), "utf-8");
}

export function writeArtifact(filename: string, content: string) {
    fs.mkdirSync(DIR_ARTIFACT_TESTS, { recursive: true });
    fs.writeFileSync(path.join(DIR_ARTIFACT_TESTS, filename), content, "utf-8");
}
