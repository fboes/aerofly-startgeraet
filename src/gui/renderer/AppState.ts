import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import * as AeroflyFlightHelper from "../../core/util/AeroflyFlightHelper.js";
import * as AeroflyFlightFormatter from "../../core/formatter/AeroflyFlightFormatter.js";
import { RoutePlanService } from "../../core/services/RoutePlanService.js";
import { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";

export class AppState {
    readonly dateTime: {
        utc: {
            date: string;
            time: string;
            timeZoneOffset_h: number;
        };
        local: {
            date: string;
            time: string;
            timeZoneOffset_h: number;
        };
    };

    readonly route: {
        routeString: string;
        distance_nm: number;
        flightTime: {
            hours: number;
            minutes: number;
        };
    };

    readonly clouds: {
        height_ft: number;
        density: number;
    }[];

    constructor(
        public readonly aeroflyFlight: AeroflyFlight,
        public readonly aircraftData: AeroflyAircraft | undefined,
    ) {
        this.aeroflyFlight = aeroflyFlight;
        this.dateTime = this.getDateTime();
        this.route = this.getRoute();
        this.clouds = this.getClouds();
    }

    protected getDateTime() {
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

    protected formatDateTime(date: Date): { date: string; time: string } {
        const dateStr = date.toISOString().split("T")[0];
        const timeStr = date.toTimeString().split(" ")[0];
        return { date: dateStr, time: timeStr };
    }

    protected getRoute() {
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

    protected getClouds() {
        return this.aeroflyFlight.clouds.map((cloud) => ({
            height_ft: cloud.height_ft,
            density: cloud.density,
        }));
    }
}
