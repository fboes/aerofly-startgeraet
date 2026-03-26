import { Config } from "../io/Config.js";
/**
 * Finds local flight plan files
 */
export declare class ImportFileFinderService {
  private config;
  constructor(config: Config);
  /**
   * Finds all flight plan files in the import directory. The import directory can be configured in the application settings and defaults to the user's Downloads folder.
   * @returns qualified filenames
   */
  findImportFiles(): string[] | null;
}
//# sourceMappingURL=ImportFileFinderService.d.ts.map
