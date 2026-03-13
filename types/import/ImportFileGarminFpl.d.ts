import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ImportFileXMLHandler } from "./ImportFileHandler.js";
/**
 * Import `fpl` Gamin FPL files
 * @see https://www8.garmin.com/xmlschemas/FlightPlanv1.xsd
 */
export declare class ImportFileGarminFpl extends ImportFileXMLHandler {
    static readonly fileExtension = "fpl";
    convert(content: string, flightplan: AeroflyFlight): void;
    private getWaypoints;
    private getWaypointDefinitions;
    private convertWaypointToAerofly;
}
//# sourceMappingURL=ImportFileGarminFpl.d.ts.map