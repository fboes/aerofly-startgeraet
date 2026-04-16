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
import { SimBriefApi, SimBriefApiPayload, SimBriefApiPayloadAirport } from "./SimBriefApi.js";
import { AeroflyAircraftService } from "../services/AeroflyAircraftService.js";
import { metarParser } from "aewx-metar-parser";

export class SimBriefAeroflyApi extends SimBriefApi {
    constructor(private aircraftService: AeroflyAircraftService) {
        super();
    }

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
            waypoints.reduce((acc, wp) => Math.max(acc, wp.altitude ?? 0), 0), // max altitude of all waypoints for cruise altitude
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
                    new AeroflyNavRouteWaypoint(
                        navlogItem.ident,
                        Number(navlogItem.pos_long),
                        Number(navlogItem.pos_lat),
                        {
                            altitude_ft: Number(navlogItem.altitude_feet),
                            navaidFrequency:
                                Number(navlogItem.frequency) > 118
                                    ? Number(navlogItem.frequency) * 1000
                                    : Number(navlogItem.frequency) * 1_000_000,
                        },
                    ),
            );

        wayPoints.pop();
        return wayPoints;
    }

    protected convertWeather(flight: AeroflyFlight, airport: SimBriefApiPayloadAirport) {
        const metar = metarParser(airport.metar);

        flight.wind = new AeroflySettingsWind(
            metar.wind.speed_kts,
            metar.wind.degrees ?? 0,
            metar.wind.gust_kts ?? 0,
            metar.temperature.celsius ?? 14,
        );

        flight.clouds = metar.clouds.map((metarCloud) => {
            const cloud = AeroflySettingsCloud.createInFeet(0, metarCloud.feet);
            cloud.density_code = metarCloud.code;
            return cloud;
        });

        flight.visibility_meter = metar.visibility.meters;
    }

    protected findAeroflyAircraftCode(
        simbriefIcaoCode: string,
        simbriefAirlineCode: string,
    ): {
        aeroflyAircraftCode: string;
        aeroflyAircraftLivery: string;
    } {
        const aeroflyAircraft = this.aircraftService.getAircraftByIcaoCode(simbriefIcaoCode);
        if (!aeroflyAircraft) {
            throw new Error(`Could not find matching Aerofly aircraft for SimBrief ICAO code ${simbriefIcaoCode}`);
        }

        const aeroflyAircraftLivery = this.aircraftService.getLiveryForAircraftByIcaoCode(
            aeroflyAircraft,
            simbriefAirlineCode,
        );

        return {
            aeroflyAircraftCode: aeroflyAircraft.aeroflyCode,
            aeroflyAircraftLivery: aeroflyAircraftLivery?.aeroflyCode ?? "",
        };
    }
}
