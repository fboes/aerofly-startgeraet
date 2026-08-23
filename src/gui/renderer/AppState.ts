import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import * as AeroflyFlightHelper from "../../core/util/AeroflyFlightHelper.js";
import * as AeroflyFlightFormatter from "../../core/formatter/AeroflyFlightFormatter.js";
import { RoutePlanService } from "../../core/services/RoutePlanService.js";
import type { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import { SkyVectorUrl } from "../../core/data/SkyVectorUrl.js";
import type { Config } from "../../core/io/Config.js";
import type { AeroflylightCategoryUs, AeroflylightCategoryIcao } from "../../core/util/AeroflyFlightHelper.js";
import {
    getSunPositionName,
    type AeroflyFlightFormatterSunPosition,
} from "../../core/formatter/AeroflyFlightFormatter.js";

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
            sunPosition: AeroflyFlightFormatterSunPosition;
        };
    };

    readonly route: {
        routeString: string;
        routeUrl: string;
        departureAirport: string;
        departureAirportCode: string;
        departureAirportUrl: string;
        destinationAirport: string;
        destinationAirportCode: string;
        destinationAirportUrl: string;
        distance_nm: number;
        cruiseAltitude_ft: number;
        cruiseSpeed_kts: number;
        flightTime: {
            hours: number;
            minutes: number;
        };
    };

    readonly clouds: {
        height_ft: number;
        density: number;
    }[];

    readonly flightCategory: {
        us: AeroflylightCategoryUs;
        icao: AeroflylightCategoryIcao;
    };

    readonly config: ReturnType<Config["toJSON"]>;

    constructor(
        public readonly aeroflyFlight: AeroflyFlight,
        public readonly aircraftData: AeroflyAircraft | undefined,
        public readonly getMaxRemainingPayload_kg: number,
        public readonly metar: string | null,
        public readonly isMissingMainMcf: boolean,
        config: Config,
    ) {
        this.aeroflyFlight = aeroflyFlight;
        this.dateTime = this.getDateTime();
        this.route = this.getRoute();
        this.clouds = this.getClouds();
        this.flightCategory = this.getFlightCategory();
        this.config = config.toJSON();
    }

    protected getDateTime() {
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

    protected formatDateTime(dateIn: Date): { date: string; time: string } {
        const isoString = dateIn.toISOString().split("T");
        const date = isoString[0];
        const time = isoString[1].substring(0, 5);
        return { date, time };
    }

    protected getRoute() {
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

    protected getFlightCategory() {
        return {
            us: AeroflyFlightHelper.getFlightCategory(this.aeroflyFlight),
            icao: AeroflyFlightHelper.getIcaoFlightCategory(this.aeroflyFlight),
        };
    }

    protected getClouds() {
        return this.aeroflyFlight.clouds.map((cloud) => ({
            height_ft: cloud.height_ft,
            density: cloud.density,
        }));
    }
}
