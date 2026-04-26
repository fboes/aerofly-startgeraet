import path from "node:path";
import fs from "node:fs";
import { Config } from "../io/Config.js";
import { GarminFplToAeroflyFlightConverter } from "../converter/other/GarminFplToAeroflyFlightConverter.js";
import { MsfsPlnToAeroflyFlightConverter } from "../converter/other/MsfsPlnToAeroflyFlightConverter.js";
import { XplaneFmsToAeroflyFlightConverter } from "../converter/other/XplaneFmsToAeroflyFlightConverter.js";
import { AeroflyMcfToImportFileConverter } from "../converter/other/AeroflyMcfToImportFileConverter.js";
import { AeroflyCustomMissionsTmcToAeroflyFlightConverter } from "../converter/other/AeroflyCustomMissionsTmcToAeroflyFlightConverter.js";
import { AeroflyCustomMissionsJsonToAeroflyFlightConverter } from "../converter/other/AeroflyCustomMissionsJsonToAeroflyFlightConverter.js";

/**
 * Finds local flight plan files
 */
export class ImportFileFinderService {
    constructor(private readonly config: Config) {}

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
                file.toLowerCase().endsWith(AeroflyCustomMissionsJsonToAeroflyFlightConverter.fileExtension) ||
                file.toLowerCase().endsWith(AeroflyCustomMissionsTmcToAeroflyFlightConverter.fileExtension) ||
                file.toLowerCase().endsWith(AeroflyMcfToImportFileConverter.fileExtension) ||
                file.toLowerCase().endsWith(GarminFplToAeroflyFlightConverter.fileExtension) ||
                file.toLowerCase().endsWith(MsfsPlnToAeroflyFlightConverter.fileExtension) ||
                file.toLowerCase().endsWith(XplaneFmsToAeroflyFlightConverter.fileExtension),
        );

        if (importFiles.length === 0) {
            return null;
        }

        return importFiles.map((file) => path.join(importDirectory, file));
    }
}
