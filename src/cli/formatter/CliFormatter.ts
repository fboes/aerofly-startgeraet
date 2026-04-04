import { styleText } from "node:util";
import { ApplicationService } from "../../core/services/ApplicationService.js";
/**
 * Helper class to write styled messages to the console.
 */
export class CliFormatter {
    static writeln(message: string) {
        process.stdout.write(message + "\n");
    }

    static writeSuccess(message: string) {
        process.stdout.write(styleText("greenBright", "✓ " + message + "\n"));
    }

    static writeError(message: string) {
        process.stdout.write(styleText("redBright", "⚠  " + message + "\n"));
    }

    static writeCatch(error: unknown) {
        CliFormatter.writeError(error instanceof Error ? error.message : String(error));
    }

    static showMenuTitle(titles: string[] = []) {
        process.stdout.write([ApplicationService.getApplicationNameVersion(), ...titles].join(" → ") + "\n");
    }
}
