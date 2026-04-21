import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
export declare class SkyVectorService {
    protected aeroflyFlight: AeroflyFlight;
    protected cruiseSpeed_kts: number | undefined;
    constructor(aeroflyFlight: AeroflyFlight, cruiseSpeed_kts?: number | undefined);
    /**
     * @returns string like 'https://skyvector.com/?ll=58.64732108,16.32458497&chart=301&zoom=4&fpl=N0122A025%20ESSL%205831N01558E%20ESVE%20ESKN'
     */
    toString(): URL;
    getWaypointIdentifiers(): string[];
    protected getWaypointIdentifier(c: AeroflyNavRouteBase): string;
}
//# sourceMappingURL=SkyvectorUrl.d.ts.map
