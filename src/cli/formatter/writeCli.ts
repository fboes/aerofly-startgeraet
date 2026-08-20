import { styleText } from "node:util";
import { APPLICATION_INFORMATION } from "../../core/services/getApplicationInformation.js";

/**
 * Helper class to write styled messages to the console.
 */
export function writeln(message: string) {
    process.stdout.write(message + "\n");
}

export function writeSuccess(message: string) {
    process.stdout.write(styleText("greenBright", "✓ " + message + "\n"));
}

export function writeError(message: string) {
    process.stdout.write(styleText("redBright", "⚠  " + message + "\n"));
}

export function writeCatch(error: unknown) {
    writeError(error instanceof Error ? error.message : String(error));
}

export function writeMenuTitle(titles: string[] = []) {
    process.stdout.write([APPLICATION_INFORMATION.nameVersion, ...titles].join(" → ") + "\n");
}
