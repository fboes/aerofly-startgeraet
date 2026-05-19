import { styleText } from "node:util";
import { getApplicationNameVersion } from "../../core/services/ApplicationService.js";

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

export function showMenuTitle(titles: string[] = []) {
    process.stdout.write([getApplicationNameVersion(), ...titles].join(" → ") + "\n");
}
