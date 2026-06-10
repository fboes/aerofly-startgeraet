import * as AeroflyFlightHelper from "../../core/util/AeroflyFlightHelper.js";
import * as AeroflyFlightFormatter from "../../core/formatter/AeroflyFlightFormatter.js";
import { RoutePlanService } from "../../core/services/RoutePlanService.js";
import { SkyVectorUrl } from "../../core/data/SkyVectorUrl.js";
import { AeroflyFlightToMetarConverter } from "../../core/converter/aerofly-flight/AeroflyFlightToMetarConverter.js";
export class AppState {
    aeroflyFlight;
    aircraftData;
    dateTime;
    route;
    clouds;
    flightCategory;
    metar;
    config;
    metarConverter = new AeroflyFlightToMetarConverter();
    constructor(aeroflyFlight, aircraftData, config) {
        this.aeroflyFlight = aeroflyFlight;
        this.aircraftData = aircraftData;
        this.aeroflyFlight = aeroflyFlight;
        this.dateTime = this.getDateTime();
        this.route = this.getRoute();
        this.clouds = this.getClouds();
        this.flightCategory = this.getFlightCategory();
        this.config = config.toJSON();
        this.metar = this.metarConverter.convert(aeroflyFlight);
    }
    getDateTime() {
        const localTime = AeroflyFlightHelper.getLocalTimeAndDate(this.aeroflyFlight);
        const timeZoneOffset_h = AeroflyFlightHelper.getLocalTimeZoneOffset(this.aeroflyFlight);
        return {
            utc: {
                ...this.formatDateTime(this.aeroflyFlight.timeUtc.time),
                timeZoneOffset_h: 0,
            },
            local: {
                ...this.formatDateTime(localTime),
                timeZoneOffset_h,
            },
        };
    }
    formatDateTime(dateIn) {
        const isoString = dateIn.toISOString().split("T");
        const date = isoString[0];
        const time = isoString[1].substring(0, 5);
        return { date, time };
    }
    getRoute() {
        const routeString = AeroflyFlightFormatter.getFlightplanWaypoints(this.aeroflyFlight, 3);
        const lastLeg = new RoutePlanService(this.aeroflyFlight).getRouteLegs().at(-1);
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
