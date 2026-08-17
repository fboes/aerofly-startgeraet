import { type AeroflyFlight, AeroflySettingsCloud, AeroflySettingsWind } from "@fboes/aerofly-custom-missions";
import { AviationWeatherApi } from "./AviationWeatherApi.js";

export class AviationWeatherApiAerofly extends AviationWeatherApi {
    async fetchMetarToFlight(airportCode: string, flight: AeroflyFlight): Promise<AeroflyFlight> {
        const weathers = await new AviationWeatherApi().fetchMetar([airportCode], flight.timeUtc.time);

        if (!weathers.length) {
            throw new Error(`No METAR information found for "${airportCode}" on ${flight.timeUtc.time.toISOString()}`);
        }
        const weather = this.normalizeWeather(weathers[0]);

        flight.clouds = weather.clouds.map((c) => {
            const cloud = AeroflySettingsCloud.createInFeet(0, c.base ?? 0);
            cloud.density_code = c.cover;
            return cloud;
        });

        flight.visibility_sm = Math.min(10, weather.visib);

        flight.wind = new AeroflySettingsWind(weather.wspd, weather.wdir ?? 0, weather.wgst ?? 0, weather.temp);

        return flight;
    }

    async fetchTafToFlight(airportCode: string, flight: AeroflyFlight): Promise<AeroflyFlight> {
        const stations = await new AviationWeatherApi().fetchTaf([airportCode], flight.timeUtc.time);

        if (!stations.length) {
            throw new Error(`No TAF station found for "${airportCode}" on ${flight.timeUtc.time.toISOString()}`);
        }

        const station = this.normalizeTaf(stations[0]);

        const weathers = station.fcsts;
        if (!weathers.length) {
            throw new Error(`No TAF forecasts found for "${airportCode}" on ${flight.timeUtc.time.toISOString()}`);
        }

        const weather = weathers[0];

        flight.clouds = weather.clouds.map((c) => {
            const cloud = AeroflySettingsCloud.createInFeet(0, c.base ?? 0);
            cloud.density_code = c.cover;
            return cloud;
        });

        flight.visibility_sm = Math.min(10, weather.visib ?? 10);
        flight.wind.speed_kts = weather.wspd ?? 0;
        flight.wind.gust_kts = weather.wgst ?? 0;
        flight.wind.directionInDegree = weather.wdir ?? 0;
        // TODO: What about temperature? It is not included in TAF.

        return flight;
    }
}
