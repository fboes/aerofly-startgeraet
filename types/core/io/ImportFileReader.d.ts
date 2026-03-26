import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ImportFileConverter } from "../converter/ImportFileConverter.js";
/**
 * Reads a file and converts it into `AeroflyFlight` by selecting the
 * appropriate converter class.
 */
export declare class ImportFileReader {
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
  static importFile(filename: string, flightplan: AeroflyFlight): void;
  static getConverter(filename: string): new () => ImportFileConverter;
}
//# sourceMappingURL=ImportFileReader.d.ts.map
