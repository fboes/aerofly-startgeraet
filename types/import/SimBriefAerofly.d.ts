import { AeroflyFlight, AeroflyNavRouteWaypoint } from "@fboes/aerofly-custom-missions";
import { SimBrief, SimBriefApiPayload, SimBriefApiPayloadAirport } from "./SimBrief.js";
export declare class SimBriefAerofly extends SimBrief {
    fetchMission(username: string, flight: AeroflyFlight, useDestinationWeather?: boolean): Promise<void>;
    convertMission(simbriefPayload: SimBriefApiPayload, flight: AeroflyFlight, useDestinationWeather?: boolean): void;
    protected getWaypointsFromNavlog(simbriefPayload: SimBriefApiPayload): AeroflyNavRouteWaypoint[];
    protected convertWeather(flight: AeroflyFlight, airport: SimBriefApiPayloadAirport): void;
    protected findAeroflyAircraftCode(simbriefIcaoCode: string, simbriefAirlineCode: string): {
        aeroflyAircraftCode: string;
        aeroflyAircraftLivery: string;
    };
}
//# sourceMappingURL=SimBriefAerofly.d.ts.map