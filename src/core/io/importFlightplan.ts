import fs from "node:fs";
import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { MsfsPlnToAeroflyFlightConverter } from "../converter/other/MsfsPlnToAeroflyFlightConverter.js";
import { GarminFplToAeroflyFlightConverter } from "../converter/other/GarminFplToAeroflyFlightConverter.js";
import type { StringToAeroflyFlightConverter } from "../converter/other/StringToAeroflyFlightConverter.js";
import { XplaneFmsToAeroflyFlightConverter } from "../converter/other/XplaneFmsToAeroflyFlightConverter.js";
import { AeroflyMcfToImportFileConverter } from "../converter/other/AeroflyMcfToImportFileConverter.js";
import { AeroflyCustomMissionsTmcToAeroflyFlightConverter } from "../converter/other/AeroflyCustomMissionsTmcToAeroflyFlightConverter.js";

/**
 * Reads a file and converts it into `AeroflyFlight` by selecting the
 * appropriate converter class.
 */

export const IMPORT_FILE_EXTENSIONS: {
    name: string;
    extension: string;
}[] = [
    {
        name: AeroflyCustomMissionsTmcToAeroflyFlightConverter.fileName,
        extension: AeroflyCustomMissionsTmcToAeroflyFlightConverter.fileExtension,
    },
    {
        name: AeroflyMcfToImportFileConverter.fileName,
        extension: AeroflyMcfToImportFileConverter.fileExtension,
    },
    {
        name: MsfsPlnToAeroflyFlightConverter.fileName,
        extension: MsfsPlnToAeroflyFlightConverter.fileExtension,
    },
    {
        name: GarminFplToAeroflyFlightConverter.fileName,
        extension: GarminFplToAeroflyFlightConverter.fileExtension,
    },
    {
        name: XplaneFmsToAeroflyFlightConverter.fileName,
        extension: XplaneFmsToAeroflyFlightConverter.fileExtension,
    },
];

export const IMPORT_FILE_TYPES: string[] = IMPORT_FILE_EXTENSIONS.map(c => c.extension);

const IMPORT_REGISTRY: Record<string, (new () => StringToAeroflyFlightConverter) | undefined> = {
    [AeroflyCustomMissionsTmcToAeroflyFlightConverter.fileExtension]: AeroflyCustomMissionsTmcToAeroflyFlightConverter,
    [AeroflyMcfToImportFileConverter.fileExtension]: AeroflyMcfToImportFileConverter,
    [MsfsPlnToAeroflyFlightConverter.fileExtension]: MsfsPlnToAeroflyFlightConverter,
    [GarminFplToAeroflyFlightConverter.fileExtension]: GarminFplToAeroflyFlightConverter,
    [XplaneFmsToAeroflyFlightConverter.fileExtension]: XplaneFmsToAeroflyFlightConverter,
};

export function getFlightplansFromFile(filename: string): string[] {
    const content = fs.readFileSync(filename, "utf8");
    return getFlightplansFromString(content, filename);
}

export function getFlightplansFromString(content: string, filename: string): string[] {
    const converter = getImportConverter(filename);
    return new converter().getIndices(content);
}

/**
 * Imports a flight plan from a file and converts it to an AeroflyFlight object.
 * Supported file types are determined by the file extension.
 *
 * @param filename The path to the flight plan file to import.
 * @param flightplan The AeroflyFlight object to populate with the imported data.
 * @param index If multiple flight plans are present in a given file, select which index to import
 * @throws Will throw an error if the file type is unsupported or if the conversion fails.
 * @see StringToAeroflyFlightConverter for the interface that specific file handlers must implement.
 * @see MsfsPlnToAeroflyFlightConverter for handling Microsoft Flight Simulator .pln files.
 * @see GarminFplToAeroflyFlightConverter for handling Garmin .fpl files.
 */
export function importFile(filename: string, flightplan: AeroflyFlight, index = 0): void {
    const content = fs.readFileSync(filename, "utf8");
    importString(content, filename, flightplan, index);
}

/**
 * @see importFile
 */
export function importString(content: string, filename: string, flightplan: AeroflyFlight, index = 0): void {
    const converter = getImportConverter(filename);
    new converter().convert(content, flightplan, index);
}

export function getImportConverter(filename: string): new () => StringToAeroflyFlightConverter {
    const fileSuffix = filename.replace(/^[^.]+\./, "");
    if (!fileSuffix) {
        throw new Error(`Could not determine file type for "${filename}"`);
    }

    const converter = IMPORT_REGISTRY[fileSuffix];
    if (!converter) {
        throw new Error(`Unsupported file type: ${fileSuffix}`);
    }
    return converter;
}
