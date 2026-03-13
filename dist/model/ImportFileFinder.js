import path from "path";
import fs from "fs";
export class ImportFileFinder {
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
        const importFiles = files.filter((file) => file.toLowerCase().endsWith(".pln") || file.toLowerCase().endsWith(".pln"));
        if (importFiles.length === 0) {
            return null;
        }
        return importFiles.map((file) => path.join(importDirectory, file));
    }
}
