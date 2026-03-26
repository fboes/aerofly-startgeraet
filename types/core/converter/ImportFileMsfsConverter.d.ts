import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ImportFileXMLConverter } from "./ImportFileConverter.js";
/**
 * Import `pln` flight plan files from Microsoft Flight Simulator 2020 / 2024
 * @see https://docs.flightsimulator.com/html/Content_Configuration/Flights_And_Missions/Flight_Plan_Definitions.htm
 * @see https://docs.flightsimulator.com/msfs2024/html/5_Content_Configuration/Mission_XML_Files/EFB_Flight_Plan_XML_Properties.htm
 */
export declare class ImportFileMsfs extends ImportFileXMLConverter {
  static readonly fileExtension = "pln";
  convert(content: string, flightplan: AeroflyFlight): void;
  private getWaypoints;
  private convertWaypointToAerofly;
  private getRunway;
  private convertCoordinate;
}
//# sourceMappingURL=ImportFileMsfsConverter.d.ts.map
