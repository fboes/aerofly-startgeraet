import { AeroflyFlightHelper } from "../../core/util/AeroflyFlightHelper.js";
import { AeroflyFlightFormatter } from "../../core/formatter/AeroflyFlightFormatter.js";
import { RoutePlanService } from "../../core/services/RoutePlanService.js";
export class AeroflyFlightBridge {
    aeroflyFlight;
    dateTime;
    route;
    constructor(aeroflyFlight) {
        this.aeroflyFlight = aeroflyFlight;
        this.aeroflyFlight = aeroflyFlight;
        this.dateTime = this.getDateTime();
        this.route = this.getRoute();
    }
    getDateTime() {
        const localTime = AeroflyFlightHelper.getLocalTimeAndDate(this.aeroflyFlight);
        const timeZoneOffset_h = AeroflyFlightHelper.getLocalTomeZoneOffset(this.aeroflyFlight);
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
    formatDateTime(date) {
        const dateStr = date.toISOString().split("T")[0];
        const timeStr = date.toTimeString().split(" ")[0];
        return { date: dateStr, time: timeStr };
    }
    getRoute() {
        const routeString = AeroflyFlightFormatter.getFlightplanWaypoints(this.aeroflyFlight);
        const lastLeg = new RoutePlanService(this.aeroflyFlight).getRouteLegs().at(-1);
        const distance_nm = lastLeg?.distanceTotal_nm ?? 0;
        const flightTime_min = lastLeg?.estimatedTimeEnrouteTotal_min ?? 0;
        const flightTime = {
            hours: Math.floor(flightTime_min / 60),
            minutes: Math.round(flightTime_min % 60),
        };
        return {
            routeString,
            distance_nm,
            flightTime,
        };
    }
}
