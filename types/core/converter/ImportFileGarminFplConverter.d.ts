import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ImportFileXMLConverter } from "./ImportFileConverter.js";
/**
 * Import `fpl` Gamin FPL files
 * @see https://www8.garmin.com/xmlschemas/FlightPlanv1.xsd
 */
export declare class ImportFileGarminFpl extends ImportFileXMLConverter {
    static readonly fileExtension = "fpl";
    convert(content: string, flightplan: AeroflyFlight): void;
    private getWaypoints;
    private getWaypointDefinitions;
    private convertWaypointToAerofly;
}
//# sourceMappingURL=ImportFileGarminFplConverter.d.ts.map
