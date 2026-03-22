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
    const converter = this.getConverter(filename);
    const content = fs.readFileSync(filename, "utf8");
    return new converter().convert(content, flightplan);
  }

  static getConverter(filename: string): new () => ImportFileConverter {
    const fileSuffix = filename.split(".").pop()?.toLowerCase();
    if (!fileSuffix) {
      throw new Error(`Could not determine file type for "${filename}"`);
    }

    const registry: Record<string, new () => ImportFileConverter> = {
      [AeroflyMcfConverter.fileExtension]: AeroflyMcfConverter,
      [ImportFileMsfs.fileExtension]: ImportFileMsfs,
      [ImportFileGarminFpl.fileExtension]: ImportFileGarminFpl,
      [ImportFileXplaneFms.fileExtension]: ImportFileXplaneFms,
    };

    const converter = registry[fileSuffix];
    if (!converter) {
      throw new Error(`Unsupported file type: ${fileSuffix}`);
    }
    return converter;
  }
}
