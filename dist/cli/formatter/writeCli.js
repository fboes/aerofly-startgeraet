import { styleText } from "node:util";
import { getApplicationNameVersion } from "../../core/services/getApplicationInformation.js";
/**
 * Helper class to write styled messages to the console.
 */
export function writeln(message) {
    process.stdout.write(message + "\n");
}
export function writeSuccess(message) {
    process.stdout.write(styleText("greenBright", "✓ " + message + "\n"));
}
export function writeError(message) {
    process.stdout.write(styleText("redBright", "⚠  " + message + "\n"));
}
export function writeCatch(error) {
    writeError(error instanceof Error ? error.message : String(error));
}
export function writeMenuTitle(titles = []) {
    process.stdout.write([getApplicationNameVersion(), ...titles].join(" → ") + "\n");
}
