import { AeroflyFlight, AeroflySettingsCloud, AeroflySettingsWind } from "@fboes/aerofly-custom-missions";
import { AviationWeatherApi, AviationWeatherNormalizedMetar } from "./AviationWeatherApi.js";

export class AviationWeatherApiAerofly extends AviationWeatherApi {
  static async fetchMetarToFlight(airportCode: string, flight: AeroflyFlight): Promise<AeroflyFlight> {
    const weathers = await AviationWeatherApi.fetchMetar([airportCode], flight.timeUtc.time);

    if (!weathers.length) {
      throw new Error(`No METAR information found for "${airportCode}" on ${flight.timeUtc.time.toISOString()}`);
    }
    const weather = new AviationWeatherNormalizedMetar(weathers[0]);

    flight.clouds = weather.clouds.map((c) => {
      const cloud = AeroflySettingsCloud.createInFeet(0, c.base ?? 0);
      cloud.density_code = c.cover;
      return cloud;
    });

    flight.visibility_sm = Math.min(10, weather.visib);

    flight.wind = new AeroflySettingsWind(weather.wspd, weather.wdir ?? 0, weather.wgst ?? 0, weather.temp ?? 14);

    return flight;
  }
}
