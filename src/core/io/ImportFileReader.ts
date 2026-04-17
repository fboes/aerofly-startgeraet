import fs from "node:fs";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ImportFileMsfs } from "../converter/ImportFileMsfsConverter.js";
import { ImportFileGarminFplConverter } from "../converter/ImportFileGarminFplConverter.js";
import { ImportFileConverter } from "../converter/ImportFileConverter.js";
import { ImportFileXplaneFms } from "../converter/ImportFileXplaneFmsConverter.js";
import { ImportFileAeroflyMcfConverter } from "../converter/ImportFileAeroflyMcfConverter.js";
import { ImportFileAeroflyCustomMissionsTmcConverter } from "../converter/ImportFileAeroflyCustomMissionsTmcConverter.js";
import { ImportFileAeroflyCustomMissionsJsonConverter } from "../converter/ImportFileAeroflyCustomMissionsJsonConverter.js";

/**
 * Reads a file and converts it into `AeroflyFlight` by selecting the
 * appropriate converter class.
 */
export class ImportFileReader {
    static getFlightplansFromFile(filename: string): string[] {
        const content = fs.readFileSync(filename, "utf8");
        return this.getFlightplansFromString(content, filename);
    }

    static getFlightplansFromString(content: string, filename: string) {
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
    static importFile(filename: string, flightplan: AeroflyFlight, index = 0): void {
        const content = fs.readFileSync(filename, "utf8");
        this.importString(content, filename, flightplan, index);
    }

    /**
     * @see importFile
     */
    static importString(content: string, filename: string, flightplan: AeroflyFlight, index = 0): void {
        const converter = this.getConverter(filename);
        new converter().convert(content, flightplan, index);
    }

    static getConverter(filename: string): new () => ImportFileConverter {
        const fileSuffix = filename.replace(/^[^.]+\./, "");
        if (!fileSuffix) {
            throw new Error(`Could not determine file type for "${filename}"`);
        }

        const registry = this.getRegistry();

        const converter = registry[fileSuffix];
        if (!converter) {
            throw new Error(`Unsupported file type: ${fileSuffix}`);
        }
        return converter;
    }

    static getRegistry(): Record<string, (new () => ImportFileConverter) | undefined> {
        return {
            [ImportFileAeroflyCustomMissionsJsonConverter.fileExtension]: ImportFileAeroflyCustomMissionsJsonConverter,
            [ImportFileAeroflyCustomMissionsTmcConverter.fileExtension]: ImportFileAeroflyCustomMissionsTmcConverter,
            [ImportFileAeroflyMcfConverter.fileExtension]: ImportFileAeroflyMcfConverter,
            [ImportFileMsfs.fileExtension]: ImportFileMsfs,
            [ImportFileGarminFplConverter.fileExtension]: ImportFileGarminFplConverter,
            [ImportFileXplaneFms.fileExtension]: ImportFileXplaneFms,
        };
    }
}
