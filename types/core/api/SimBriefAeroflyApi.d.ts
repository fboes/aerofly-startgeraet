import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { SimBriefApi, SimBriefApiPayload } from "./SimBriefApi.js";
import { AeroflyAircraftService } from "../services/AeroflyAircraftService.js";
export declare class SimBriefAeroflyApi extends SimBriefApi {
    private aircraftService;
    constructor(aircraftService: AeroflyAircraftService);
    fetchMission(username: string, flight: AeroflyFlight, useDestinationWeather?: boolean): Promise<void>;
    convertMission(simbriefPayload: SimBriefApiPayload, flight: AeroflyFlight, useDestinationWeather?: boolean): void;
    private getWaypointsFromNavlog;
    private convertWeather;
    private findAeroflyAircraftCode;
}
//# sourceMappingURL=SimBriefAeroflyApi.d.ts.map
