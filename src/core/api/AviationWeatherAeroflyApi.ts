import { type AeroflyFlight, AeroflySettingsCloud, AeroflySettingsWind } from "@fboes/aerofly-custom-missions";
import { AviationWeatherApi } from "./AviationWeatherApi.js";
import type {
    AviationWeatherNormalizedAirport,
    AviationWeatherNormalizedMetar,
    AviationWeatherApiNormalizedTafForecast,
    AviationWeatherApiRunwaySurface,
} from "./AviationWeatherApi.type.js";
import { ErrorFormatted } from "../util/ErrorFormatted.js";
import { UNIT_METER_PER_FEET } from "../util/units.js";

export type BestRunway = {
    id: string;

    /**
     * length, width in ft
     */
    dimension: {
        length: number;
        width: number;
    };
    isRight: boolean;
    surface: AviationWeatherApiRunwaySurface;
    alignment: number;
};

const api = new AviationWeatherApi();

const airportCache = new Map<string, AviationWeatherNormalizedAirport>();

/**
 * Fetch METAR report for current flight setup, set METAR data to current flight
 * @param airportCode ICAO
 * @param flight current mission
 * @returns altered mission
 */
export async function fetchMetarToFlight(airportCode: string, flight: AeroflyFlight): Promise<AeroflyFlight> {
    const weathers = await new AviationWeatherApi().fetchMetar([airportCode], flight.timeUtc.time);

    if (!weathers[0]) {
        throw new ErrorFormatted(`No METAR information found for "{{ airportCode }}" at {{ time }}`, {
            airportCode,
            time: flight.timeUtc.time.toISOString(),
        });
    }
    const weather = api.normalizeWeather(weathers[0]);

    return convertNormalizedWeatherToFlight(weather, flight);
}

function convertNormalizedWeatherToFlight(
    weather: AviationWeatherNormalizedMetar,
    flight: AeroflyFlight,
): AeroflyFlight {
    flight.clouds = weather.clouds.map((c) => {
        const cloud = AeroflySettingsCloud.createInFeet(0, c.base ?? 0);
        cloud.density_code = c.cover;
        return cloud;
    });

    flight.visibility_sm = Math.min(10, weather.visib);

    flight.wind = new AeroflySettingsWind(weather.wspd, weather.wdir ?? 0, weather.wgst ?? 0, weather.temp);

    return flight;
}

/**
 * Fetch TAF forecast for current flight setup, set TAF data to current flight
 * @param airportCode ICAO
 * @param flight current mission
 * @returns altered mission
 */
export async function fetchTafToFlight(airportCode: string, flight: AeroflyFlight): Promise<AeroflyFlight> {
    const stations = await new AviationWeatherApi().fetchTaf([airportCode], flight.timeUtc.time);

    if (!stations[0]) {
        throw new ErrorFormatted(`No TAF station found for "{{ airportCode }}" at {{ time }}`, {
            airportCode,
            time: flight.timeUtc.time.toISOString(),
        });
    }

    const station = api.normalizeTaf(stations[0]);

    const weathers = station.fcsts;
    if (!weathers.length) {
        throw new ErrorFormatted(`No TAF forecasts found for "{{ airportCode }}" at {{ time }}`, {
            airportCode,
            time: flight.timeUtc.time.toISOString(),
        });
    }

    const weather = weathers[0];
    if (!weather) {
        throw new ErrorFormatted(`No TAF forecast found for "{{ airportCode }}" at {{ time }}`, {
            airportCode,
            time: flight.timeUtc.time.toISOString(),
        });
    }

    return convertNormalizedTafForecastToFlight(weather, flight);
}

function convertNormalizedTafForecastToFlight(
    weather: AviationWeatherApiNormalizedTafForecast,
    flight: AeroflyFlight,
): AeroflyFlight {
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

/**
 * Get airport information like coordinates, runways, etc.
 * @param airportIcaoCode
 * @returns airport information
 */
export async function getAirportCached(airportIcaoCode: string): Promise<AviationWeatherNormalizedAirport> {
    const cachedAirport = airportCache.get(airportIcaoCode);
    if (cachedAirport) {
        return cachedAirport;
    }

    const airports = await api.fetchAirports([airportIcaoCode]);
    if (!airports[0]) {
        throw new ErrorFormatted(`No airport information found for "{{ airportIcaoCode }}"`, {
            airportIcaoCode,
        });
    }

    airportCache.set(airportIcaoCode, airports[0]);
    return airports[0];
}

/**
 * @returns the best runway to land into / start into the wind, as well as
 *   considering the minimum runway length.
 */
export async function getBestRunway(
    airportIcaoCode: string,
    windDirection: number,
    windSpeed_kts: number,
    minimumRunwayLength_m: number | null = null,
): Promise<BestRunway> {
    const airport = await getAirportCached(airportIcaoCode);
    if (airport.runways.length === 0) {
        throw new ErrorFormatted(`No runways found for "{{ airportIcaoCode }}"`, {
            airportIcaoCode,
        });
    }

    const possibleRunways: BestRunway[] = airport.runways
        .filter((r) => r.alignment !== null)
        .filter(
            // Removing runways which are too short
            (r) =>
                minimumRunwayLength_m === null ||
                minimumRunwayLength_m === 0 ||
                minimumRunwayLength_m <= r.dimension[0] * UNIT_METER_PER_FEET,
        )
        .map(
            // Converting single runway into two opposite runway starting points
            (r) =>
                r.id.map(
                    (t: string, index: number): BestRunway => ({
                        id: t,
                        dimension: {
                            length: r.dimension[0] ?? 0,
                            width: r.dimension[1] ?? 0,
                        },
                        isRight: t.endsWith("R"),
                        surface: r.surface,
                        alignment: ((r.alignment ?? 0) + index * 180 - (t.endsWith("R") ? 0.25 : 0)) % 360,
                    }),
                ),
        )
        .flat();

    if (windSpeed_kts <= 5 && possibleRunways[0]) {
        return possibleRunways[0];
    }

    return possibleRunways.reduce((a, b) => {
        return degreeDifference(a.alignment, windDirection) < degreeDifference(b.alignment, windDirection) ? a : b;
    });
}

/**
 * Computes the difference between to angles
 */
function degreeDifference(fromDegree: number, toDegree: number): number {
    let result = toDegree - fromDegree;
    while (result > 180) {
        result -= 360;
    }
    while (result < -180) {
        result += 360;
    }

    return Math.abs(result);
}
