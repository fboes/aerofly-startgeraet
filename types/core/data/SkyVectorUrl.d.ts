import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class SkyVectorUrl {
    private aeroflyFlight;
    private cruiseSpeed_kts;
    constructor(aeroflyFlight: AeroflyFlight, cruiseSpeed_kts?: number | undefined);
    toURL(): URL;
    /**
     * @returns string like 'https://skyvector.com/?ll=58.64732108,16.32458497&chart=301&zoom=4&fpl=N0122A025%20ESSL%205831N01558E%20ESVE%20ESKN'
     */
    toString(): string;
    getWaypointIdentifiers(): string[];
    private getWaypointIdentifier;
}
//# sourceMappingURL=SkyVectorUrl.d.ts.map
