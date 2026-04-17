import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ExportFileConverter } from "./ExportFileConverter.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
export declare class ExportFileKmlConverter extends ExportFileConverter {
    static readonly fileExtension = "kml";
    convert(flightplan: AeroflyFlight): string;
    protected xml(str: string): string;
    protected coordinatesToString(wp: AeroflyNavRouteBase): string;
}
//# sourceMappingURL=ExportFileKmlConverter.d.ts.map
