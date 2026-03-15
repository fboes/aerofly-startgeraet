import {
  AeroflyFlight,
  AeroflySettingsAircraft,
  AeroflySettingsFlight,
  AeroflySettingsFuelLoad,
  AeroflyTimeUtc,
  AeroflySettingsWind,
  AeroflySettingsCloud,
  AeroflyNavigationConfig,
  AeroflyNavRouteOrigin,
  AeroflyNavRouteDestination,
  AeroflyNavRouteDepartureRunway,
  AeroflyNavRouteDestinationRunway,
  AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";

import AeroflyAircraftLiveries from "@fboes/aerofly-data/data/aircraft-liveries.json" with { type: "json" };
import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";

import { SimBrief, SimBriefApiPayload, SimBriefApiPayloadAirport } from "./SimBrief.js";

export class SimBriefAerofly extends SimBrief {
  public async fetchMission(
    username: string,
    flight: AeroflyFlight,
    useDestinationWeather: boolean = false,
  ): Promise<void> {
    const simbriefPayload = await this.fetch(username);
    this.convertMission(simbriefPayload, flight, useDestinationWeather);
  }

  public convertMission(
    simbriefPayload: SimBriefApiPayload,
    flight: AeroflyFlight,
    useDestinationWeather = false,
  ): void {
    this.convertWeather(flight, !useDestinationWeather ? simbriefPayload.origin : simbriefPayload.destination);

    const { aeroflyAircraftCode, aeroflyAircraftLivery } = this.findAeroflyAircraftCode(
      simbriefPayload.aircraft.icaocode,
      simbriefPayload.general.icao_airline,
    );

    const originRunwayOrientation = Number(simbriefPayload.origin.plan_rwy.replace(/\D+/, "")) * 10;
    const destinationRunwayOrientation = Number(simbriefPayload.destination.plan_rwy.replace(/\D+/, "")) * 10;

    flight.aircraft = new AeroflySettingsAircraft(aeroflyAircraftCode, aeroflyAircraftLivery);
    flight.flightSetting = AeroflySettingsFlight.createInFeet(
      Number(simbriefPayload.origin.pos_long),
      Number(simbriefPayload.origin.pos_lat),
      Number(simbriefPayload.origin.elevation),
      originRunwayOrientation,
      0,
      {
        gear: 1,
        throttle: 0,
        flaps: 0,
        configuration: "OnGround",
        onGround: true,
        airport: simbriefPayload.origin.icao_code,
        runway: simbriefPayload.origin.plan_rwy,
      },
    );
    flight.fuelLoadSetting = new AeroflySettingsFuelLoad(
      aeroflyAircraftCode,
      Number(simbriefPayload.fuel.plan_ramp),
      Number(simbriefPayload.weights.payload),
      "Keep",
    );
    flight.timeUtc = new AeroflyTimeUtc(new Date(simbriefPayload.times.sched_out));

    const waypoints = this.getWaypointsFromNavlog(simbriefPayload);
    flight.navigation = new AeroflyNavigationConfig(
      waypoints.reduce((acc, wp) => Math.max(acc + (wp.altitude ?? 0)), 0), // max altitude of all waypoints for cruise altitude
      [
        new AeroflyNavRouteOrigin(
          simbriefPayload.origin.icao_code,
          Number(simbriefPayload.origin.pos_long),
          Number(simbriefPayload.origin.pos_lat),
          {
            elevation_ft: Number(simbriefPayload.origin.elevation),
          },
        ),
        new AeroflyNavRouteDepartureRunway(
          simbriefPayload.origin.plan_rwy,
          Number(simbriefPayload.origin.pos_long),
          Number(simbriefPayload.origin.pos_lat),
          {
            elevation_ft: Number(simbriefPayload.origin.elevation),
            direction_degree: originRunwayOrientation,
          },
        ),
        ...waypoints,
        new AeroflyNavRouteDestinationRunway(
          simbriefPayload.destination.plan_rwy,
          Number(simbriefPayload.destination.pos_long),
          Number(simbriefPayload.destination.pos_lat),
          {
            elevation_ft: Number(simbriefPayload.destination.elevation),
            direction_degree: destinationRunwayOrientation,
          },
        ),
        new AeroflyNavRouteDestination(
          simbriefPayload.destination.icao_code,
          Number(simbriefPayload.destination.pos_long),
          Number(simbriefPayload.destination.pos_lat),
          {
            elevation_ft: Number(simbriefPayload.destination.elevation),
          },
        ),
      ],
    );
  }

  protected getWaypointsFromNavlog(simbriefPayload: SimBriefApiPayload): AeroflyNavRouteWaypoint[] {
    const wayPoints = simbriefPayload.navlog
      .filter((navlogItem) => navlogItem.type !== "ltlg")
      .map(
        (navlogItem) =>
          new AeroflyNavRouteWaypoint(navlogItem.ident, Number(navlogItem.pos_long), Number(navlogItem.pos_lat), {
            altitude_ft: Number(navlogItem.altitude_feet),
            navaidFrequency:
              Number(navlogItem.frequency) > 118
                ? Number(navlogItem.frequency) * 1000
                : Number(navlogItem.frequency) * 1_000_000,
          }),
      );

    wayPoints.pop();
    return wayPoints;
  }

  protected convertWeather(flight: AeroflyFlight, airport: SimBriefApiPayloadAirport) {
    const windMatch = airport.metar.match(/\b(\d{3})(\d{2})(?:G(\d{2}))?KT\b/);
    const temperatureMatch = airport.metar.match(/\b(M?\d+)\/(M?\d+)\b/);
    flight.wind = new AeroflySettingsWind(
      windMatch && windMatch[2] ? Number(windMatch[2]) : 0,
      windMatch && windMatch[1] ? Number(windMatch[1]) : 0,
      windMatch && windMatch[3] ? Number(windMatch[3]) : 0,
      temperatureMatch && temperatureMatch[1] ? Number(temperatureMatch[1].replace("M", "-")) : 14, // default to 15°C if not available
    );

    const clouds = [...airport.metar.matchAll(/\b(FEW|SCT|BKN|OVC":)(\d{3})\b/g)];
    flight.clouds = clouds.map((cloudMatch) => {
      const cloud = AeroflySettingsCloud.createInFeet(0, Number(cloudMatch[2]) * 100);
      cloud.density_code = cloudMatch[1] as "FEW" | "SCT" | "BKN" | "OVC";
      return cloud;
    });

    flight.visibility_meter = Number(airport.metar_visibility != "9999" ? airport.metar_visibility : 20000);
  }

  protected findAeroflyAircraftCode(
    simbriefIcaoCode: string,
    simbriefAirlineCode: string,
  ): {
    aeroflyAircraftCode: string;
    aeroflyAircraftLivery: string;
  } {
    const aeroflyAircraft = AeroflyAircraftLiveries.find(
      (a: AeroflyAircraft) => a.icaoCode.toLowerCase() === simbriefIcaoCode.toLowerCase(),
    );
    if (!aeroflyAircraft) {
      throw new Error(`Could not find matching Aerofly aircraft for SimBrief ICAO code ${simbriefIcaoCode}`);
    }

    const aeroflyAircraftLivery = aeroflyAircraft.liveries
      .filter((l: AeroflyAircraftLivery) => l.icaoCode != null)
      .find((l: AeroflyAircraftLivery) => l.icaoCode?.toUpperCase() === simbriefAirlineCode.toUpperCase());

    return {
      aeroflyAircraftCode: aeroflyAircraft.aeroflyCode,
      aeroflyAircraftLivery: aeroflyAircraftLivery?.aeroflyCode ?? "",
    };
  }
}
