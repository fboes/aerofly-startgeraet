import { AeroflySettingsAircraft, AeroflySettingsFlight, AeroflySettingsFuelLoad, AeroflyTimeUtc, AeroflySettingsWind, AeroflySettingsCloud, AeroflyNavigationConfig, AeroflyNavRouteOrigin, AeroflyNavRouteDestination, AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestinationRunway, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
import { SimBriefApi } from "./SimBriefApi.js";
import { metarParser } from "aewx-metar-parser";
import { getAeroflyAircraftByIcaoCode, getAeroflyLiveryByIcaoCode } from "../services/getAeroflyAircraft.js";
export class SimBriefAeroflyApi extends SimBriefApi {
    /**
     *
     * @param username
     * @param flight
     * @param useDestinationWeather 0 for origin, 1 for destination, -1 for none at all
     */
    async fetchMission(username, flight, useDestinationWeather = 0) {
        const simbriefPayload = await this.fetch(username);
        this.convertMission(simbriefPayload, flight, useDestinationWeather);
    }
    /**
     *
     * @param simbriefPayload
     * @param flight
     * @param useDestinationWeather 0 for origin, 1 for destination, -1 for none at all
     */
    convertMission(simbriefPayload, flight, useDestinationWeather = 0) {
        if (useDestinationWeather >= 0) {
            this.convertWeather(flight, useDestinationWeather === 0 ? simbriefPayload.origin : simbriefPayload.destination);
        }
        const originRunwayOrientation = Number(simbriefPayload.origin.plan_rwy.replace(/\D+/, "")) * 10;
        const destinationRunwayOrientation = Number(simbriefPayload.destination.plan_rwy.replace(/\D+/, "")) * 10;
        flight.flightSetting = AeroflySettingsFlight.createInFeet(Number(simbriefPayload.origin.pos_long), Number(simbriefPayload.origin.pos_lat), Number(simbriefPayload.origin.elevation), originRunwayOrientation, 0, {
            gear: 1,
            throttle: 0,
            flaps: 0,
            configuration: "OnGround",
            onGround: true,
            airport: simbriefPayload.origin.icao_code,
            runway: simbriefPayload.origin.plan_rwy,
        });
        try {
            const { aeroflyAircraftCode, aeroflyAircraftLivery } = this.findAeroflyAircraftCode(simbriefPayload.aircraft.icaocode, simbriefPayload.general.icao_airline);
            flight.aircraft = new AeroflySettingsAircraft(aeroflyAircraftCode, aeroflyAircraftLivery);
            flight.fuelLoadSetting = new AeroflySettingsFuelLoad(aeroflyAircraftCode, Number(simbriefPayload.fuel.plan_ramp), Number(simbriefPayload.weights.payload), "Keep");
        }
        catch (e) {
            if (!(e instanceof Error)) {
                throw e;
            }
        }
        flight.timeUtc = new AeroflyTimeUtc(new Date(simbriefPayload.times.sched_out));
        const waypoints = this.getWaypointsFromNavlog(simbriefPayload);
        flight.navigation = AeroflyNavigationConfig.createInFeet(Number(simbriefPayload.general.initial_altitude), [
            new AeroflyNavRouteOrigin(simbriefPayload.origin.icao_code, Number(simbriefPayload.origin.pos_long), Number(simbriefPayload.origin.pos_lat), {
                elevation_ft: Number(simbriefPayload.origin.elevation),
            }),
            new AeroflyNavRouteDepartureRunway(simbriefPayload.origin.plan_rwy, Number(simbriefPayload.origin.pos_long), Number(simbriefPayload.origin.pos_lat), {
                elevation_ft: Number(simbriefPayload.origin.elevation),
                direction_degree: originRunwayOrientation,
            }),
            ...waypoints,
            new AeroflyNavRouteDestinationRunway(simbriefPayload.destination.plan_rwy, Number(simbriefPayload.destination.pos_long), Number(simbriefPayload.destination.pos_lat), {
                elevation_ft: Number(simbriefPayload.destination.elevation),
                direction_degree: destinationRunwayOrientation,
            }),
            new AeroflyNavRouteDestination(simbriefPayload.destination.icao_code, Number(simbriefPayload.destination.pos_long), Number(simbriefPayload.destination.pos_lat), {
                elevation_ft: Number(simbriefPayload.destination.elevation),
            }),
        ], Number(simbriefPayload.general.cruise_tas));
    }
    getWaypointsFromNavlog(simbriefPayload) {
        const wayPoints = simbriefPayload.navlog
            .filter((navlogItem) => navlogItem.type !== "ltlg")
            .map((navlogItem) => new AeroflyNavRouteWaypoint(navlogItem.ident, Number(navlogItem.pos_long), Number(navlogItem.pos_lat), {
            altitude_ft: Number(navlogItem.altitude_feet),
            navaidFrequency: Number(navlogItem.frequency) > 118
                ? Number(navlogItem.frequency) * 1000
                : Number(navlogItem.frequency) * 1_000_000,
        }));
        wayPoints.pop();
        return wayPoints;
    }
    convertWeather(flight, airport) {
        const metar = metarParser(airport.metar);
        flight.wind = new AeroflySettingsWind(metar.wind.speed_kts, metar.wind.degrees ?? 0, metar.wind.gust_kts ?? 0, metar.temperature.celsius ?? 14);
        flight.clouds = metar.clouds.map((metarCloud) => {
            const cloud = AeroflySettingsCloud.createInFeet(0, metarCloud.feet);
            cloud.density_code = metarCloud.code;
            return cloud;
        });
        flight.visibility_meter = metar.visibility.meters;
    }
    findAeroflyAircraftCode(simbriefIcaoCode, simbriefAirlineCode) {
        const aeroflyAircraft = getAeroflyAircraftByIcaoCode(simbriefIcaoCode);
        if (!aeroflyAircraft) {
            throw new Error(`Could not find matching Aerofly aircraft for SimBrief ICAO code ${simbriefIcaoCode}`);
        }
        const aeroflyAircraftLivery = getAeroflyLiveryByIcaoCode(aeroflyAircraft, simbriefAirlineCode);
        return {
            aeroflyAircraftCode: aeroflyAircraft.aeroflyCode,
            aeroflyAircraftLivery: aeroflyAircraftLivery?.aeroflyCode ?? "",
        };
    }
}
