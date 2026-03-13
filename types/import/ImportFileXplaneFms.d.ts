import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ImportFileXMLHandler } from "./ImportFileHandler.js";
/**
 * Import `.fms` flight plan files from X-Plane 11 / 12
 * @see https://developer.x-plane.com/article/flightplan-files-v11-fms-file-format/
 * @see https://xp-soaring.github.io/tasks/x-plane_fms_format.html
 */
export declare class ImportFileXplaneFms extends ImportFileXMLHandler {
    static readonly fileExtension = "fms";
    convert(content: string, flightplan: AeroflyFlight): void;
    private getRunway;
    private getWaypoints;
    private convertWaypointToAerofly;
}
//# sourceMappingURL=ImportFileXplaneFms.d.ts.map