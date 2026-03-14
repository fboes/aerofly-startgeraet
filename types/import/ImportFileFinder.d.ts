import { Config } from "../model/Config.js";
export declare class ImportFileFinder {
  private config;
  constructor(config: Config);
  /**
   * Finds all flight plan files in the import directory. The import directory can be configured in the application settings and defaults to the user's Downloads folder.
   * @returns qualified filenames
   */
  findImportFiles(): string[] | null;
}
//# sourceMappingURL=ImportFileFinder.d.ts.map
