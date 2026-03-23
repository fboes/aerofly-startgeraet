import type { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ExportFileConverter } from "./ExportFileConverter.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
export declare class ExportFileAeroflyCustomMissionsTmcConverter implements ExportFileConverter {
    static readonly fileExtension = "tmc";
    convert(flightplan: AeroflyFlight): string;
    getWaypointType(w: AeroflyNavRouteBase): import("@fboes/aerofly-custom-missions/types/dto/AeroflyMissionCheckpoint.js").AeroflyMissionCheckpointType;
    protected findAircraftData(aeroflyCodeAircraft: string): AeroflyAircraft | undefined;
}
//# sourceMappingURL=ExportFileAeroflyCustomMissionsTmcConverter.d.ts.map