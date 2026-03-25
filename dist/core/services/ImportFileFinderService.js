import path from "node:path";
import fs from "node:fs";
import { ImportFileGarminFpl } from "../converter/ImportFileGarminFplConverter.js";
import { ImportFileMsfs } from "../converter/ImportFileMsfsConverter.js";
import { ImportFileXplaneFms } from "../converter/ImportFileXplaneFmsConverter.js";
import { ImportFileAeroflyMcfConverter } from "../converter/ImportFileAeroflyMcfConverter.js";
/**
 * Finds local flight plan files
 */
export class ImportFileFinderService {
    constructor(config) {
        this.config = config;
    }
    /**
     * Finds all flight plan files in the import directory. The import directory can be configured in the application settings and defaults to the user's Downloads folder.
     * @returns qualified filenames
     */
    findImportFiles() {
        const importDirectory = this.config.importDirectory;
        if (!fs.existsSync(importDirectory)) {
            return null;
        }
        const files = fs.readdirSync(importDirectory);
        const importFiles = files.filter((file) => file.toLowerCase().endsWith(ImportFileAeroflyMcfConverter.fileExtension) ||
            file.toLowerCase().endsWith(ImportFileGarminFpl.fileExtension) ||
            file.toLowerCase().endsWith(ImportFileMsfs.fileExtension) ||
            file.toLowerCase().endsWith(ImportFileXplaneFms.fileExtension));
        if (importFiles.length === 0) {
            return null;
        }
        return importFiles.map((file) => path.join(importDirectory, file));
    }
}
