import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { StringToAeroflyFlightConverter } from "../converter/other/StringToAeroflyFlightConverter.js";
/**
 * Reads a file and converts it into `AeroflyFlight` by selecting the
 * appropriate converter class.
 */
export declare class ImportFileReader {
    static getFlightplansFromFile(filename: string): string[];
    static getFlightplansFromString(content: string, filename: string): string[];
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
     * @see StringToAeroflyFlightConverter for the interface that specific file handlers must implement.
     * @see MsfsPlnToAeroflyFlightConverter for handling Microsoft Flight Simulator .pln files.
     * @see GarminFplToAeroflyFlightConverter for handling Garmin .fpl files.
     */
    static importFile(filename: string, flightplan: AeroflyFlight, index?: number): void;
    /**
     * @see importFile
     */
    static importString(content: string, filename: string, flightplan: AeroflyFlight, index?: number): void;
    static getConverter(filename: string): new () => StringToAeroflyFlightConverter;
    static getRegistry(): Record<string, (new () => StringToAeroflyFlightConverter) | undefined>;
}
//# sourceMappingURL=ImportFileReader.d.ts.map
