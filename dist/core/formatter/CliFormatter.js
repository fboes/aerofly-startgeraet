import { styleText } from "node:util";
/**
 * Helper class to write styled messages to the console.
 */
export class CliFormatter {
    static writeln(message) {
        process.stdout.write("  " + message + "\n");
    }
    static writeSuccess(message) {
        process.stdout.write(styleText("greenBright", "✓ " + message + "\n"));
    }
    static writeError(message) {
        process.stdout.write(styleText("redBright", "⚠  " + message + "\n"));
    }
    static writeCatch(error) {
        CliFormatter.writeError(error instanceof Error ? error.message : String(error));
    }
    static showMenuTitle(titles = []) {
        process.stdout.write(["Aerofly Startgerät", ...titles].join(" → ") + "\n");
    }
}
