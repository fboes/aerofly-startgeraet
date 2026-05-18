import { styleText } from "node:util";
import * as ApplicationService from "../../core/services/ApplicationService.js";
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
export function showMenuTitle(titles = []) {
    process.stdout.write([ApplicationService.getApplicationNameVersion(), ...titles].join(" → ") + "\n");
}
