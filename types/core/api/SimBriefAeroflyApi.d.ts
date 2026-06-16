import { type AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { SimBriefApi, type SimBriefApiPayload } from "./SimBriefApi.js";
export declare class SimBriefAeroflyApi extends SimBriefApi {
    /**
     *
     * @param username
     * @param flight
     * @param useDestinationWeather 0 for origin, 1 for destination, -1 for none at all
     */
    fetchMission(username: string, flight: AeroflyFlight, useDestinationWeather?: number): Promise<void>;
    /**
     *
     * @param simbriefPayload
     * @param flight
     * @param useDestinationWeather 0 for origin, 1 for destination, -1 for none at all
     */
    convertMission(simbriefPayload: SimBriefApiPayload, flight: AeroflyFlight, useDestinationWeather?: number): void;
    private getWaypointsFromNavlog;
    private convertWeather;
    private findAeroflyAircraftCode;
}
//# sourceMappingURL=SimBriefAeroflyApi.d.ts.map