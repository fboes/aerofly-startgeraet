import { AeroflyFlight, AeroflyNavRouteWaypoint } from "@fboes/aerofly-custom-missions";
import { SimBriefApi, SimBriefApiPayload, SimBriefApiPayloadAirport } from "./SimBriefApi.js";
export declare class SimBriefAeroflyApi extends SimBriefApi {
    fetchMission(username: string, flight: AeroflyFlight, useDestinationWeather?: boolean): Promise<void>;
    convertMission(simbriefPayload: SimBriefApiPayload, flight: AeroflyFlight, useDestinationWeather?: boolean): void;
    protected getWaypointsFromNavlog(simbriefPayload: SimBriefApiPayload): AeroflyNavRouteWaypoint[];
    protected convertWeather(flight: AeroflyFlight, airport: SimBriefApiPayloadAirport): void;
    protected findAeroflyAircraftCode(
        simbriefIcaoCode: string,
        simbriefAirlineCode: string,
    ): {
        aeroflyAircraftCode: string;
        aeroflyAircraftLivery: string;
    };
}
//# sourceMappingURL=SimBriefAeroflyApi.d.ts.map
