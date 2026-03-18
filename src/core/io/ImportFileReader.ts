import fs from "node:fs";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ImportFileMsfs } from "../converter/ImportFileMsfsConverter.js";
import { ImportFileGarminFpl } from "../converter/ImportFileGarminFplConverter.js";
import { ImportFileConverter as ImportFileConverter } from "../converter/ImportFileConverter.js";
import { ImportFileXplaneFms } from "../converter/ImportFileXplaneFmsConverter.js";
import { AeroflyMcfConverter } from "../converter/ImportFileAeroflyMcfConverter.js";

export class ImportFileReader {
  /**
   * Imports a flight plan from a file and converts it to an AeroflyFlight object.
   * Supported file types are determined by the file extension:
   * - .pln: Microsoft Flight Simulator flight plan file
   * - .fpl: Garmin FPL file
   *
   * @param filename The path to the flight plan file to import.
   * @param flightplan The AeroflyFlight object to populate with the imported data.
   * @throws Will throw an error if the file type is unsupported or if the conversion fails.
   * @see ImportFileConverter for the interface that specific file handlers must implement.
   * @see ImportFileMsfs for handling Microsoft Flight Simulator .pln files.
   * @see ImportFileGarminFpl for handling Garmin .fpl files.
   */
  static importFile(filename: string, flightplan: AeroflyFlight): void {
    const fileSuffix = filename.split(".").pop()?.toLowerCase();

    let converter: ImportFileConverter | null = null;
    switch (fileSuffix) {
      case AeroflyMcfConverter.fileExtension:
        converter = new AeroflyMcfConverter();
        break;
      case ImportFileMsfs.fileExtension:
        converter = new ImportFileMsfs();
        break;
      case ImportFileGarminFpl.fileExtension:
        converter = new ImportFileGarminFpl();
        break;
      case ImportFileXplaneFms.fileExtension:
        converter = new ImportFileXplaneFms();
        break;
    }
    if (converter === null) {
      throw new Error(`Unsupported file type: ${fileSuffix}`);
    }

    const content = fs.readFileSync(filename, "utf8");

    return converter.convert(content, flightplan);
  }
}
