import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import * as AeroflyFlightHelper from "../../core/util/AeroflyFlightHelper.js";
import type { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
export declare class AppState {
    readonly aeroflyFlight: AeroflyFlight;
    readonly aircraftData: AeroflyAircraft | undefined;
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
        routeUrl: string;
        departureAirport: string;
        departureAirportCode: string;
        departureAirportUrl: string;
        destinationAirport: string;
        destinationAirportCode: string;
        destinationAirportUrl: string;
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
    readonly flightCategory: {
        us: string;
        icao: string;
    };
    constructor(aeroflyFlight: AeroflyFlight, aircraftData: AeroflyAircraft | undefined);
    protected getDateTime(): {
        utc: {
            timeZoneOffset_h: number;
            date: string;
            time: string;
        };
        local: {
            timeZoneOffset_h: number;
            date: string;
            time: string;
        };
    };
    protected formatDateTime(date: Date): {
        date: string;
        time: string;
    };
    protected getRoute(): {
        routeString: string;
        routeUrl: string;
        distance_nm: number;
        flightTime: {
            hours: number;
            minutes: number;
        };
        departureAirport: string;
        departureAirportCode: string;
        departureAirportUrl: string;
        destinationAirport: string;
        destinationAirportCode: string;
        destinationAirportUrl: string;
    };
    protected getFlightCategory(): {
        us: AeroflyFlightHelper.AeroflylightCategory;
        icao: AeroflyFlightHelper.AeroflylightCategoryIcao;
    };
    protected getClouds(): {
        height_ft: number;
        density: number;
    }[];
}
//# sourceMappingURL=AppState.d.ts.map
