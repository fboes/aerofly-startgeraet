import { Vector, type Point } from "@fboes/geojson";
import { fetchAirportCached, fetchBestRunway, type BestRunway } from "../../core/api/AviationWeatherAeroflyApi.js";
import type { AviationWeatherNormalizedAirport } from "../../core/api/AviationWeatherApi.type.js";
import type { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import { UNIT_METER_PER_FEET } from "../../core/util/units.js";
import { fetchOpenTopoData } from "../../core/api/OpenTopoDataApi.js";
import { ErrorFormatted } from "../../core/util/ErrorFormatted.js";
import { degreeNormalize } from "../../core/util/degree.js";

/**
 * Additional airport data for current origin / destination airport not provided
 * by internal database. Will be fetched via API.
 */
export async function getAirportDataViaOrigin(
    flightPlanService: AeroflyFlightService,
    useDestination: boolean = false,
): Promise<AviationWeatherNormalizedAirport> {
    const airport = useDestination
        ? flightPlanService.getFlightplanArrivalAirport()
        : flightPlanService.getFlightplanDepartureAirport();
    if (!airport) {
        throw new Error("Please provide an initial airport");
    }

    return fetchAirportCached(airport.identifier);
}

/**
 * Runway best matching the current airport and wind settings. Runway data will
 * be fetched via API.
 */
export async function getBestRunwayViaFlightService(
    airportData: AviationWeatherNormalizedAirport,
    flightPlanService: AeroflyFlightService,
): Promise<BestRunway> {
    return fetchBestRunway(airportData.icaoId, flightPlanService.getWindDirection(), flightPlanService.getWindSpeed());
}

/**
 * Point data for runway, according to expected placement in Aerofly FS 4
 */
export function getRunwayPoint(runwayData: BestRunway, airportPoint: Point): Point {
    return airportPoint.getPointBy(
        new Vector(runwayData.dimension.length / 2, degreeNormalize(runwayData.alignment + 180)),
    );
}

/**
 * Get minimum safe altitude in meters.
 * If user provided MSA, use this, else call the Open Top API.
 */
export async function getMinimumSafeAltitude(
    aircraftPoint: Point,
    minimumSafeAltitude_ft: number | undefined = undefined,
): Promise<number> {
    if (minimumSafeAltitude_ft) {
        return minimumSafeAltitude_ft * UNIT_METER_PER_FEET;
    }

    const results = await fetchOpenTopoData([
        {
            lat: aircraftPoint.latitude,
            lng: aircraftPoint.longitude,
        },
    ]);

    const result = results.results[0];
    if (!result) {
        throw new ErrorFormatted("No elevation could be determined, status {{ status }}", {
            status: results.status,
        });
    }

    return result.elevation + 1500 * UNIT_METER_PER_FEET;
}
