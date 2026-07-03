import { type AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
/**
 * Import `fpl` Gamin FPL files
 * @see https://www8.garmin.com/xmlschemas/FlightPlanv1.xsd
 */
export declare class GarminFplToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    static readonly fileName = "Garmin Flight Plan File";
    static readonly fileExtension = "fpl";
    getIndices(content: string): string[];
    convert(content: string, flightplan: AeroflyFlight, index?: number): void;
    private getRoutes;
    private getWaypoints;
    private getWaypointDefinitions;
    private convertWaypointToAerofly;
}
//# sourceMappingURL=GarminFplToAeroflyFlightConverter.d.ts.map