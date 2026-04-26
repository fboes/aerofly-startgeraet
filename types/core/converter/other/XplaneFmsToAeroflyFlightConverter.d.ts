import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
/**
 * Import `.fms` flight plan files from X-Plane 11 / 12
 * @see https://developer.x-plane.com/article/flightplan-files-v11-fms-file-format/
 * @see https://xp-soaring.github.io/tasks/x-plane_fms_format.html
 */
export declare class XplaneFmsToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    static readonly fileExtension = "fms";
    convert(content: string, flightplan: AeroflyFlight, index?: number): void;
    private getRunway;
    private getWaypoints;
    private convertWaypointToAerofly;
}
//# sourceMappingURL=XplaneFmsToAeroflyFlightConverter.d.ts.map
