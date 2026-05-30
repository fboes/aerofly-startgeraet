import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { SimBriefApi, type SimBriefApiPayload } from "./SimBriefApi.js";
export declare class SimBriefAeroflyApi extends SimBriefApi {
    fetchMission(username: string, flight: AeroflyFlight, useDestinationWeather?: boolean): Promise<void>;
    convertMission(simbriefPayload: SimBriefApiPayload, flight: AeroflyFlight, useDestinationWeather?: boolean): void;
    private getWaypointsFromNavlog;
    private convertWeather;
    private findAeroflyAircraftCode;
}
//# sourceMappingURL=SimBriefAeroflyApi.d.ts.map
