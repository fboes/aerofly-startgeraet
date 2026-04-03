import { AeroflyFlight, AeroflyNavRouteDestination, AeroflyNavRouteOrigin } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraftService } from "../services/AeroflyAircraftService.js";
import { AeroflyAirportService } from "../services/AeroflyAirportService.js";
import { AeroflyFlightHelper } from "../util/AeroflyFlightHelper.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";

/**
 * Additional methods to have human-readable representations of `AeroflyFlight` properties.
 */
export class AeroflyFlightFormatter {
  static getAircraft(aeroflyFlight: AeroflyFlight): string {
    const currentAircraft = AeroflyAircraftService.getAircraft(aeroflyFlight.aircraft.name);
    if (!currentAircraft) {
      return "No aircraft selected";
    }

    const currentLivery = AeroflyAircraftService.getLiveryForAircraft(
      currentAircraft,
      aeroflyFlight.aircraft.paintscheme,
    );
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
      aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin)?.identifier ?? "Unknown"
    );
  }

  static getFlightplanOriginName(aeroflyFlight: AeroflyFlight): string {
    const airportCode = this.getFlightplanOriginCode(aeroflyFlight);
    const airportName = this.getAirportName(airportCode);

    return airportName ? `${airportName} (${airportCode})` : airportCode;
  }

  static getAirportName(airportCode: string): string {
    return airportCode !== "Unknown"
      ? (AeroflyAirportService.getAirportByIcaoCode(airportCode)?.name ?? "Unknown")
      : "";
  }

  static getFlightplanDestinationCode(aeroflyFlight: AeroflyFlight): string {
    return (
      aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDestination)?.identifier ?? "Unknown"
    );
  }

  static getFlightplanDestinationName(aeroflyFlight: AeroflyFlight): string {
    const airportCode = this.getFlightplanDestinationCode(aeroflyFlight);
    const airportName = this.getAirportName(airportCode);

    return airportName ? `${airportName} (${airportCode})` : airportCode;
  }

  static getFlightplanSummary(aeroflyFlight: AeroflyFlight): string {
    return `${this.getFlightplanOriginName(aeroflyFlight)} → ${this.getFlightplanDestinationName(aeroflyFlight)} (${this.getFlightplanDistance(aeroflyFlight)})`;
  }

  static getFlightplanWaypoints(aeroflyFlight: AeroflyFlight): string {
    return aeroflyFlight.navigation.waypoints
      .map((wp: AeroflyNavRouteBase): string => {
        return wp.identifier;
      })
      .join(" → ");
  }

  static getFlightplanDistance(aeroflyFlight: AeroflyFlight): string {
    const currentAircraft = AeroflyAircraftService.getAircraft(aeroflyFlight.aircraft.name);
    if (!currentAircraft) {
      return "Unknown";
    }

    try {
      const distance = AeroflyFlightHelper.getFlightplanDistance(aeroflyFlight);
      const distanceNm = distance / 1852;
      const timeH = currentAircraft.cruiseSpeedKts ? distanceNm / currentAircraft.cruiseSpeedKts : 0;
      const timeString = timeH
        ? `, ${Math.floor(timeH)}:${Math.floor((timeH * 60) % 60)
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

  static numberToString(num: number): string {
    return new Intl.NumberFormat().format(Math.round(num));
  }

  static dateToString(date: Date): string {
    return date.toISOString().substring(0, 16).replace("T", " ");
  }
}
