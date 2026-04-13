import fs from "node:fs";
import { ImportFileMsfs } from "../converter/ImportFileMsfsConverter.js";
import { ImportFileGarminFplConverter } from "../converter/ImportFileGarminFplConverter.js";
import { ImportFileXplaneFms } from "../converter/ImportFileXplaneFmsConverter.js";
import { ImportFileAeroflyMcfConverter } from "../converter/ImportFileAeroflyMcfConverter.js";
import { ImportFileAeroflyCustomMissionsTmcConverter } from "../converter/ImportFileAeroflyCustomMissionsTmcConverter.js";
import { ImportFileAeroflyCustomMissionsJsonConverter } from "../converter/ImportFileAeroflyCustomMissionsJsonConverter.js";
/**
 * Reads a file and converts it into `AeroflyFlight` by selecting the
 * appropriate converter class.
 */
export class ImportFileReader {
    static getFlightplansFromFile(filename) {
        const content = fs.readFileSync(filename, "utf8");
        return this.getFlightplansFromString(content, filename);
    }
    static getFlightplansFromString(content, filename) {
        const converter = this.getConverter(filename);
        return new converter().getIndices(content);
    }
    /**
     * Imports a flight plan from a file and converts it to an AeroflyFlight object.
     * Supported file types are determined by the file extension:
     * - .pln: Microsoft Flight Simulator flight plan file
     * - .fpl: Garmin FPL file
     *
     * @param filename The path to the flight plan file to import.
     * @param flightplan The AeroflyFlight object to populate with the imported data.
     * @param index If multiple flight plans are present in a given file, select which index to import
     * @throws Will throw an error if the file type is unsupported or if the conversion fails.
     * @see ImportFileConverter for the interface that specific file handlers must implement.
     * @see ImportFileMsfs for handling Microsoft Flight Simulator .pln files.
     * @see ImportFileGarminFplConverter for handling Garmin .fpl files.
     */
    static importFile(filename, flightplan, index = 0) {
        const content = fs.readFileSync(filename, "utf8");
        return this.importString(content, filename, flightplan, index);
    }
    /**
     * @see importFile
     */
    static importString(content, filename, flightplan, index = 0) {
        const converter = this.getConverter(filename);
        return new converter().convert(content, flightplan, index);
    }
    static getConverter(filename) {
        const fileSuffix = filename.replace(/^[^.]+\./, "");
        if (!fileSuffix) {
            throw new Error(`Could not determine file type for "${filename}"`);
        }
        const registry = {
            [ImportFileAeroflyCustomMissionsJsonConverter.fileExtension]: ImportFileAeroflyCustomMissionsJsonConverter,
            [ImportFileAeroflyCustomMissionsTmcConverter.fileExtension]: ImportFileAeroflyCustomMissionsTmcConverter,
            [ImportFileAeroflyMcfConverter.fileExtension]: ImportFileAeroflyMcfConverter,
            [ImportFileMsfs.fileExtension]: ImportFileMsfs,
            [ImportFileGarminFplConverter.fileExtension]: ImportFileGarminFplConverter,
            [ImportFileXplaneFms.fileExtension]: ImportFileXplaneFms,
        };
        const converter = registry[fileSuffix];
        if (!converter) {
            throw new Error(`Unsupported file type: ${fileSuffix}`);
        }
        return converter;
    }
}
