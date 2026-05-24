import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class SkyVectorUrl {
    private aeroflyFlight;
    constructor(aeroflyFlight: AeroflyFlight);
    getRouteURL(cruiseSpeed_kts?: number | undefined): URL;
    getOriginURL(): URL;
    getDestinationURL(): URL;
    getAirportURL(icaoCode: string): URL;
    private getWaypointIdentifiers;
    private getWaypointIdentifier;
}
//# sourceMappingURL=SkyVectorUrl.d.ts.map
