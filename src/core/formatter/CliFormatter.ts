import { styleText } from "node:util";

/**
 * Helper class to write styled messages to the console.
 */
export class CliFormatter {
  static writeln(message: string) {
    process.stdout.write("  " + message + "\n");
  }

  static writeSuccess(message: string) {
    process.stdout.write(styleText("green", "✓ " + message + "\n"));
  }

  static writeError(message: string) {
    process.stdout.write(styleText("red", "⚠  " + message + "\n"));
  }

  static writeCatch(error: unknown) {
    CliFormatter.writeError(error instanceof Error ? error.message : String(error));
  }
}
