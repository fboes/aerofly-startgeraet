import { AeroflyFlight, AeroflyNavRouteDestination, AeroflyNavRouteOrigin } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraftService } from "../services/AeroflyAircraftService.js";
import { AeroflyAirportService } from "../services/AeroflyAirportService.js";
import { AeroflyFlightHelper } from "../util/AeroflyFlightHelper.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";

export type AeroflyFlightFormatterSunPosition = "Day" | "Night" | "Dusk" | "Dawn";

/**
 * Additional methods to have human-readable representations of `AeroflyFlight` properties.
 */
export class AeroflyFlightFormatter {
    constructor(
        protected readonly aeroflyFlight: AeroflyFlight,
        protected readonly aircraftService: AeroflyAircraftService,
        protected readonly airportService: AeroflyAirportService,
    ) {}

    static getAircraft(aeroflyFlight: AeroflyFlight, aircraftService: AeroflyAircraftService): string {
        const currentAircraft = aircraftService.getAircraft(aeroflyFlight.aircraft.name);
        if (!currentAircraft) {
            return "No aircraft selected";
        }

        const currentLivery = aircraftService.getLiveryForAircraft(currentAircraft, aeroflyFlight.aircraft.paintscheme);
        return `${currentAircraft.nameFull} - ${currentLivery?.name ?? "Default Livery"}`;
    }

    static getFuelAndPayload(aeroflyFlight: AeroflyFlight): string {
        return aeroflyFlight.fuelLoadSetting.fuelMass
            ? `${this.numberToString(aeroflyFlight.fuelLoadSetting.fuelMass)} / ${this.numberToString(aeroflyFlight.fuelLoadSetting.payloadMass)} kg`
            : "Unset";
    }

    static getFlightplanIdentifier(aeroflyFlight: AeroflyFlight): string {
        return `${this.getFlightplanOriginCode(aeroflyFlight)}-${this.getFlightplanDestinationCode(aeroflyFlight)}`.replace(
            /[^a-zA-Z0-9_-]+/g,
            "-",
        );
    }

    static getFlightplanOriginCode(aeroflyFlight: AeroflyFlight): string {
        return (
            aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin)?.identifier ??
            "Unknown"
        );
    }

    static getFlightplanOriginName(aeroflyFlight: AeroflyFlight, airportService: AeroflyAirportService): string {
        const airportCode = this.getFlightplanOriginCode(aeroflyFlight);
        const airportName = this.getAirportName(airportCode, airportService);

        return airportName ? `${airportName} (${airportCode})` : airportCode;
    }

    static getAirportName(airportCode: string, airportService: AeroflyAirportService): string {
        return airportCode !== "Unknown" ? (airportService.getAirportByIcaoCode(airportCode)?.name ?? "Unknown") : "";
    }

    static getFlightplanDestinationCode(aeroflyFlight: AeroflyFlight): string {
        return (
            aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDestination)?.identifier ??
            "Unknown"
        );
    }

    static getFlightplanDestinationName(aeroflyFlight: AeroflyFlight, airportService: AeroflyAirportService): string {
        const airportCode = this.getFlightplanDestinationCode(aeroflyFlight);
        const airportName = this.getAirportName(airportCode, airportService);

        return airportName ? `${airportName} (${airportCode})` : airportCode;
    }

    static getFlightplanSummary(
        aeroflyFlight: AeroflyFlight,
        aircraftService: AeroflyAircraftService,
        airportService: AeroflyAirportService,
    ): string {
        return `${this.getFlightplanOriginName(aeroflyFlight, airportService)} → ${this.getFlightplanDestinationName(aeroflyFlight, airportService)} (${this.getFlightplanDistance(aeroflyFlight, aircraftService)})`;
    }

    static getFlightplanWaypoints(aeroflyFlight: AeroflyFlight): string {
        return aeroflyFlight.navigation.waypoints
            .map((wp: AeroflyNavRouteBase): string => {
                return wp.identifier;
            })
            .join(" → ");
    }

    static getFlightplanDistance(aeroflyFlight: AeroflyFlight, aircraftService: AeroflyAircraftService): string {
        const currentAircraft = aircraftService.getAircraft(aeroflyFlight.aircraft.name);
        if (!currentAircraft) {
            return "Unknown";
        }

        try {
            const distance = AeroflyFlightHelper.getFlightplanDistance(aeroflyFlight);
            const distanceNm = distance / 1852;
            const timeH = currentAircraft.cruiseSpeedKts ? distanceNm / currentAircraft.cruiseSpeedKts : 0;
            const timeString = timeH
                ? `, ${Math.floor(timeH).toFixed()}:${Math.floor((timeH * 60) % 60)
                      .toString()
                      .padStart(2, "0")}h`
                : "";
            return `${this.numberToString(distanceNm)}NM${timeString}`;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            return "Unknown";
        }
    }

    static getFlightCategory(aeroflyFlight: AeroflyFlight): string {
        return `ICAO: ${AeroflyFlightHelper.getIcaoFLightCategory(aeroflyFlight)} | US: ${AeroflyFlightHelper.getFlightCategory(aeroflyFlight)}`;
    }

    static getWind(aeroflyFlight: AeroflyFlight): string {
        let wind = `${this.numberToString(aeroflyFlight.wind.directionInDegree)}° @ ${this.numberToString(aeroflyFlight.wind.speed_kts)}kts`;
        if (aeroflyFlight.wind.gust_kts > 0) {
            wind += ` (gusts ${this.numberToString(aeroflyFlight.wind.gust_kts)}kts)`;
        }
        return wind;
    }

    static getTemperature(aeroflyFlight: AeroflyFlight): string {
        return `${this.numberToString(aeroflyFlight.wind.temperature_celsius)}°C`;
    }

    static getVisibility(aeroflyFlight: AeroflyFlight): string {
        if (aeroflyFlight.visibility_sm === 10 || aeroflyFlight.visibility_meter === 9999) {
            return "10SM / " + this.numberToString(9999) + "m";
        }

        return `${this.numberToString(aeroflyFlight.visibility_sm)}SM / ${this.numberToString(aeroflyFlight.visibility_meter)}m`;
    }

    static getClouds(aeroflyFlight: AeroflyFlight): string {
        return (
            aeroflyFlight.clouds
                .filter((cloud) => cloud.density > 0)
                .map((cloud) => {
                    return `${cloud.density_code} @ ${this.numberToString(cloud.height_ft)}ft`;
                })
                .join(" | ") || "CLR"
        );
    }

    static getSunPositionName(aeroflyFlight: AeroflyFlight): AeroflyFlightFormatterSunPosition {
        const solarElevationAngleDeg = AeroflyFlightHelper.getSunPosition(aeroflyFlight).elevation;
        const localTime = AeroflyFlightHelper.getTimeAndDateDeparture(aeroflyFlight);

        if (solarElevationAngleDeg >= 0) {
            return "Day";
        } else if (solarElevationAngleDeg <= -6) {
            return "Night";
        }

        return localTime.getHours() < 12 ? "Dusk" : "Dawn";
    }

    static numberToString(num: number): string {
        return new Intl.NumberFormat().format(Math.round(num));
    }

    static dateToString(date: Date): string {
        return date.toISOString().substring(0, 16).replace("T", " ");
    }
}
