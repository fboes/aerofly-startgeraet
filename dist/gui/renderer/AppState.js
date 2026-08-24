import * as AeroflyFlightHelper from "../../core/util/AeroflyFlightHelper.js";
import * as AeroflyFlightFormatter from "../../core/formatter/AeroflyFlightFormatter.js";
import { RoutePlanService } from "../../core/services/RoutePlanService.js";
import { SkyVectorUrl } from "../../core/data/SkyVectorUrl.js";
import { getSunPositionName, } from "../../core/formatter/AeroflyFlightFormatter.js";
export class AppState {
    aeroflyFlight;
    aircraftData;
    getMaxRemainingPayload_kg;
    metar;
    isMissingMainMcf;
    dateTime;
    route;
    clouds;
    flightCategory;
    config;
    constructor(aeroflyFlight, aircraftData, getMaxRemainingPayload_kg, metar, isMissingMainMcf, config) {
        this.aeroflyFlight = aeroflyFlight;
        this.aircraftData = aircraftData;
        this.getMaxRemainingPayload_kg = getMaxRemainingPayload_kg;
        this.metar = metar;
        this.isMissingMainMcf = isMissingMainMcf;
        this.aeroflyFlight = aeroflyFlight;
        this.dateTime = this.getDateTime();
        this.route = this.getRoute();
        this.clouds = this.getClouds();
        this.flightCategory = this.getFlightCategory();
        this.config = config.toJSON();
    }
    getDateTime() {
        const localTime = AeroflyFlightHelper.getLocalTimeAndDate(this.aeroflyFlight);
        const timeZoneOffset_h = AeroflyFlightHelper.getLocalTimeZoneOffset(this.aeroflyFlight);
        const sunPosition = getSunPositionName(this.aeroflyFlight);
        return {
            utc: {
                ...this.formatDateTime(this.aeroflyFlight.timeUtc.time),
                timeZoneOffset_h: 0,
            },
            local: {
                ...this.formatDateTime(localTime),
                timeZoneOffset_h,
                sunPosition,
            },
        };
    }
    formatDateTime(dateIn) {
        const [date, time] = dateIn.toISOString().split("T");
        if (!date || !time) {
            throw new Error(`Invalid date: ${dateIn}`);
        }
        return { date, time: time.substring(0, 5) };
    }
    getRoute() {
        const cruiseAltitude_ft = this.aeroflyFlight.navigation.cruiseAltitude_ft;
        const cruiseSpeed_kts = this.aeroflyFlight.navigation._cruiseSpeed_kts ?? 0;
        const routeString = AeroflyFlightFormatter.getFlightplanWaypoints(this.aeroflyFlight, 3);
        const lastLeg = new RoutePlanService(this.aeroflyFlight).getRouteLegs(cruiseSpeed_kts).at(-1);
        const distance_nm = lastLeg?.distanceTotal_nm ?? 0;
        const flightTime_min = lastLeg?.estimatedTimeEnrouteTotal_min ?? 0;
        const flightTime = {
            hours: Math.floor(flightTime_min / 60),
            minutes: Math.round(flightTime_min % 60),
        };
        const departureAirportCode = AeroflyFlightFormatter.getFlightplanOriginCode(this.aeroflyFlight);
        const destinationAirportCode = AeroflyFlightFormatter.getFlightplanDestinationCode(this.aeroflyFlight);
        const skyVector = new SkyVectorUrl(this.aeroflyFlight);
        return {
            routeString,
            routeUrl: skyVector.getRouteURL().toString(),
            distance_nm,
            flightTime,
            departureAirport: AeroflyFlightFormatter.getFlightplanOriginName(this.aeroflyFlight),
            departureAirportCode,
            departureAirportUrl: skyVector.getOriginURL().toString(),
            destinationAirport: AeroflyFlightFormatter.getFlightplanDestinationName(this.aeroflyFlight),
            destinationAirportCode,
            destinationAirportUrl: skyVector.getDestinationURL().toString(),
            cruiseAltitude_ft,
            cruiseSpeed_kts,
        };
    }
    getFlightCategory() {
        return {
            us: AeroflyFlightHelper.getFlightCategory(this.aeroflyFlight),
            icao: AeroflyFlightHelper.getIcaoFlightCategory(this.aeroflyFlight),
        };
    }
    getClouds() {
        return this.aeroflyFlight.clouds.map((cloud) => ({
            height_ft: cloud.height_ft,
            density: cloud.density,
        }));
    }
}
