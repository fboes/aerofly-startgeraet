import { AeroflyNavRouteDestination, AeroflyNavRouteOrigin } from "@fboes/aerofly-custom-missions";
import { RoutePlanService } from "../services/RoutePlanService.js";
import { getAeroflyAircraft, getAeroflyLivery } from "../services/getAeroflyAircraft.js";
import { getAeroflyAirportByIcaoCode } from "../services/getAeroflyAirport.js";
import { getIcaoFlightCategory, getFlightCategory, getSunPosition, getTimeAndDateDeparture, } from "../util/AeroflyFlightHelper.js";
/**
 * Additional methods to have human-readable representations of `AeroflyFlight` properties.
 */
export function getAircraft(aeroflyFlight) {
    const currentAircraft = getAeroflyAircraft(aeroflyFlight.aircraft.name);
    if (!currentAircraft) {
        return "No aircraft selected";
    }
    const currentLivery = getAeroflyLivery(currentAircraft, aeroflyFlight.aircraft.paintscheme);
    return `${currentAircraft.nameFull} - ${currentLivery?.name ?? "Default Livery"}`;
}
export function getFuelAndPayload(aeroflyFlight) {
    return aeroflyFlight.fuelLoadSetting.fuelMass
        ? `${numberToString(aeroflyFlight.fuelLoadSetting.fuelMass)} / ${numberToString(aeroflyFlight.fuelLoadSetting.payloadMass)} kg`
        : "Unset";
}
export function getFlightplanIdentifier(aeroflyFlight) {
    return `${getFlightplanOriginCode(aeroflyFlight)}-${getFlightplanDestinationCode(aeroflyFlight)}`.replace(/[^a-zA-Z0-9_-]+/g, "-");
}
export function getFlightplanOriginCode(aeroflyFlight) {
    return (aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin)?.identifier ?? "Unknown");
}
export function getFlightplanOriginName(aeroflyFlight) {
    const airportCode = getFlightplanOriginCode(aeroflyFlight);
    const airportName = getAirportName(airportCode);
    return airportName ? `${airportName} (${airportCode})` : airportCode;
}
export function getAirportName(airportCode) {
    return airportCode !== "Unknown" ? (getAeroflyAirportByIcaoCode(airportCode)?.name ?? "Unknown") : "";
}
export function getFlightplanDestinationCode(aeroflyFlight) {
    return (aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDestination)?.identifier ??
        "Unknown");
}
export function getFlightplanDestinationName(aeroflyFlight) {
    const airportCode = getFlightplanDestinationCode(aeroflyFlight);
    const airportName = getAirportName(airportCode);
    return airportName ? `${airportName} (${airportCode})` : airportCode;
}
export function getFlightplanSummary(aeroflyFlight) {
    return `${getFlightplanOriginName(aeroflyFlight)} → ${getFlightplanDestinationName(aeroflyFlight)} (${getFlightplanDistance(aeroflyFlight)})`;
}
export function getFlightplanWaypoints(aeroflyFlight) {
    return aeroflyFlight.navigation.waypoints
        .map((wp) => {
        return wp.identifier;
    })
        .join(" → ");
}
export function getFlightplanDistance(aeroflyFlight) {
    const currentAircraft = getAeroflyAircraft(aeroflyFlight.aircraft.name);
    if (!currentAircraft) {
        return "Unknown";
    }
    try {
        const route = new RoutePlanService(aeroflyFlight).getRoute();
        const distanceNm = route.distanceTotal_nm;
        const timeH = route.estimatedTimeEnrouteTotal_min * 60;
        const timeString = timeH
            ? `, ${Math.floor(timeH).toFixed()}:${Math.floor((timeH * 60) % 60)
                .toString()
                .padStart(2, "0")}h`
            : "";
        return `${numberToString(distanceNm)}NM${timeString}`;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }
    catch (e) {
        return "Unknown";
    }
}
export function getCombinedFlightCategory(aeroflyFlight) {
    return `ICAO: ${getIcaoFlightCategory(aeroflyFlight)} | US: ${getFlightCategory(aeroflyFlight)}`;
}
export function getWind(aeroflyFlight) {
    let wind = `${numberToString(aeroflyFlight.wind.directionInDegree)}° @ ${numberToString(aeroflyFlight.wind.speed_kts)}kts`;
    if (aeroflyFlight.wind.gust_kts > 0) {
        wind += ` (gusts ${numberToString(aeroflyFlight.wind.gust_kts)}kts)`;
    }
    return wind;
}
export function getTemperature(aeroflyFlight) {
    return `${numberToString(aeroflyFlight.wind.temperature_celsius)}°C`;
}
export function getVisibility(aeroflyFlight) {
    if (aeroflyFlight.visibility_sm === 10 || aeroflyFlight.visibility_meter === 9999) {
        return "10SM / " + numberToString(9999) + "m";
    }
    return `${numberToString(aeroflyFlight.visibility_sm)}SM / ${numberToString(aeroflyFlight.visibility_meter)}m`;
}
export function getClouds(aeroflyFlight) {
    return (aeroflyFlight.clouds
        .filter((cloud) => cloud.density > 0)
        .map((cloud) => {
        return `${cloud.density_code} @ ${numberToString(cloud.height_ft)}ft`;
    })
        .join(" | ") || "CLR");
}
export function getSunPositionName(aeroflyFlight) {
    const solarElevationAngleDeg = getSunPosition(aeroflyFlight).elevation;
    const localTime = getTimeAndDateDeparture(aeroflyFlight);
    if (solarElevationAngleDeg >= 0) {
        return "Day";
    }
    else if (solarElevationAngleDeg <= -6) {
        return "Night";
    }
    return localTime.getHours() < 12 ? "Dusk" : "Dawn";
}
export function numberToString(num) {
    return new Intl.NumberFormat().format(Math.round(num));
}
export function dateToString(date) {
    return date.toISOString().substring(0, 16).replace("T", " ");
}
