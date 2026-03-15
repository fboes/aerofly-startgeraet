import path from "node:path";
import fs from "node:fs";
import { Config } from "../model/Config.js";
import { ImportFileGarminFpl } from "./ImportFileGarminFpl.js";
import { ImportFileMsfs } from "./ImportFileMsfs.js";
import { ImportFileXplaneFms } from "./ImportFileXplaneFms.js";
import { ImportFileAeroflyMcf } from "./ImportFileAeroflyMcf.js";

export class ImportFileFinder {
  constructor(private config: Config) {}

  /**
   * Finds all flight plan files in the import directory. The import directory can be configured in the application settings and defaults to the user's Downloads folder.
   * @returns qualified filenames
   */
  findImportFiles(): string[] | null {
    const importDirectory = this.config.importDirectory;
    if (!fs.existsSync(importDirectory)) {
      return null;
    }

    const files = fs.readdirSync(importDirectory);
    const importFiles = files.filter(
      (file: string) =>
        file.toLowerCase().endsWith(ImportFileAeroflyMcf.fileExtension) ||
        file.toLowerCase().endsWith(ImportFileGarminFpl.fileExtension) ||
        file.toLowerCase().endsWith(ImportFileMsfs.fileExtension) ||
        file.toLowerCase().endsWith(ImportFileXplaneFms.fileExtension),
    );

    if (importFiles.length === 0) {
      return null;
    }

    return importFiles.map((file) => path.join(importDirectory, file));
  }
}
