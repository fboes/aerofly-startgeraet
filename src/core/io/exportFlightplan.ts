import fs from "node:fs";
import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToAeroflyMainMcfConverter } from "../converter/aerofly-flight/AeroflyFlightToAeroflyMainMcfConverter.js";
import type { AeroflyFlightToStringConverter } from "../converter/aerofly-flight/AeroflyFlightToStringConverter.js";
import { AeroflyFlightToAeroflyCustomMissionsTmcConverter } from "../converter/aerofly-flight/AeroflyFlightToAeroflyCustomMissionsTmcConverter.js";
import { AeroflyFlightToGeoJsonConverter } from "../converter/aerofly-flight/AeroflyFlightToGeoJsonConverter.js";
import { AeroflyFlightToKmlConverter } from "../converter/aerofly-flight/AeroflyFlightToKmlConverter.js";
import { AeroflyFlightToMarkdownConverter } from "../converter/aerofly-flight/AeroflyFlightToMarkdownConverter.js";

/**
 * Writes a file from an `AeroflyFlight` class instance to an
 * external flight plan file by selecting the appropriate converter.
 */

export const EXPORT_FILE_EXTENSIONS: {
    name: string;
    extension: string;
}[] = [
    {
        name: AeroflyFlightToAeroflyMainMcfConverter.fileName,
        extension: AeroflyFlightToAeroflyMainMcfConverter.fileExtension,
    },
    {
        name: AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileName,
        extension: AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileExtension,
    },
    {
        name: AeroflyFlightToGeoJsonConverter.fileName,
        extension: AeroflyFlightToGeoJsonConverter.fileExtension,
    },
    {
        name: AeroflyFlightToKmlConverter.fileName,
        extension: AeroflyFlightToKmlConverter.fileExtension,
    },
    {
        name: AeroflyFlightToMarkdownConverter.fileName,
        extension: AeroflyFlightToMarkdownConverter.fileExtension,
    },
];

export const EXPORT_FILE_TYPES: string[] = EXPORT_FILE_EXTENSIONS.map(c => c.extension);

const EXPORT_REGISTRY: Record<string, (new () => AeroflyFlightToStringConverter) | undefined> = {
    [AeroflyFlightToAeroflyMainMcfConverter.fileExtension]: AeroflyFlightToAeroflyMainMcfConverter,
    [AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileExtension]: AeroflyFlightToAeroflyCustomMissionsTmcConverter,
    [AeroflyFlightToGeoJsonConverter.fileExtension]: AeroflyFlightToGeoJsonConverter,
    [AeroflyFlightToKmlConverter.fileExtension]: AeroflyFlightToKmlConverter,
    [AeroflyFlightToMarkdownConverter.fileExtension]: AeroflyFlightToMarkdownConverter,
};

export function exportFlightplanToString(filename: string, flightplan: AeroflyFlight): string {
    const converter = getExportConverter(filename);
    return new converter().convert(flightplan);
}

export function exportFlightplanToFile(filename: string, flightplan: AeroflyFlight): void {
    const content = exportFlightplanToString(filename, flightplan);
    fs.writeFileSync(filename, content, "utf8");
}

export function getExportConverter(filename: string): new () => AeroflyFlightToStringConverter {
    const fileSuffix = filename.split(".").pop()?.toLowerCase();
    if (!fileSuffix) {
        throw new Error(`Could not determine file type for "${filename}"`);
    }

    const converter = EXPORT_REGISTRY[fileSuffix];
    if (!converter) {
        throw new Error(`Unsupported file type: ${fileSuffix}`);
    }
    return converter;
}
