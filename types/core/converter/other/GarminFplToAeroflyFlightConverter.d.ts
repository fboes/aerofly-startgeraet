import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { XMLToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
/**
 * Import `fpl` Gamin FPL files
 * @see https://www8.garmin.com/xmlschemas/FlightPlanv1.xsd
 */
export declare class GarminFplToAeroflyFlightConverter extends XMLToAeroflyFlightConverter {
    static readonly fileExtension = "fpl";
    getIndices(content: string): string[];
    convert(content: string, flightplan: AeroflyFlight, index?: number): void;
    private getRoutes;
    private getWaypoints;
    private getWaypointDefinitions;
    private convertWaypointToAerofly;
}
//# sourceMappingURL=GarminFplToAeroflyFlightConverter.d.ts.map
