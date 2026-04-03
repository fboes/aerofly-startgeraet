import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AviationWeatherApi } from "./AviationWeatherApi.js";
export declare class AviationWeatherApiAerofly extends AviationWeatherApi {
    static fetchMetarToFlight(airportCode: string, flight: AeroflyFlight): Promise<AeroflyFlight>;
}
//# sourceMappingURL=AviationWeatherAeroflyApi.d.ts.map
