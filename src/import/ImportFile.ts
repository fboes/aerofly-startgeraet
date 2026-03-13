import fs from "node:fs";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ImportFileMsfs } from "./ImportFileMsfs.js";
import { ImportFileGarminFpl } from "./ImportFileGarminFpl.js";
import { ImportFileHandler } from "./ImportFileHandler.js";
import { ImportFileXplaneFms } from "./ImportFileXplaneFms.js";

export class ImportFile {
  /**
   * Imports a flight plan from a file and converts it to an AeroflyFlight object.
   * Supported file types are determined by the file extension:
   * - .pln: Microsoft Flight Simulator flight plan file
   * - .fpl: Garmin FPL file
   *
   * @param filename The path to the flight plan file to import.
   * @param flightplan The AeroflyFlight object to populate with the imported data.
   * @throws Will throw an error if the file type is unsupported or if the conversion fails.
   * @see ImportFileHandler for the interface that specific file handlers must implement.
   * @see ImportFileMsfs for handling Microsoft Flight Simulator .pln files.
   * @see ImportFileGarminFpl for handling Garmin .fpl files.
   */
  static importFile(filename: string, flightplan: AeroflyFlight): void {
    const fileSuffix = filename.split(".").pop()?.toLowerCase();

    let handler: ImportFileHandler | null = null;
    switch (fileSuffix) {
      case ImportFileMsfs.fileExtension:
        handler = new ImportFileMsfs();
        break;
      case ImportFileGarminFpl.fileExtension:
        handler = new ImportFileGarminFpl();
        break;
      case ImportFileXplaneFms.fileExtension:
        handler = new ImportFileXplaneFms();
        break;
    }
    if (handler === null) {
      throw new Error(`Unsupported file type: ${fileSuffix}`);
    }

    const content = fs.readFileSync(filename, "utf8");

    return handler.convert(content, flightplan);
  }
}
