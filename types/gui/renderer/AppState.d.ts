import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import * as AeroflyFlightHelper from "../../core/util/AeroflyFlightHelper.js";
import type { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import type { Config } from "../../core/io/Config.js";
export declare class AppState {
    readonly aeroflyFlight: AeroflyFlight;
    readonly aircraftData: AeroflyAircraft | undefined;
    readonly getMaxRemainingPayload_kg: number;
    readonly metar: string | null;
    readonly isMissingMainMcf: boolean;
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
        us: string;
        icao: string;
    };
    readonly config: ReturnType<Config["toJSON"]>;
    constructor(aeroflyFlight: AeroflyFlight, aircraftData: AeroflyAircraft | undefined, getMaxRemainingPayload_kg: number, metar: string | null, isMissingMainMcf: boolean, config: Config);
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
    protected formatDateTime(dateIn: Date): {
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
        cruiseAltitude_ft: number;
        cruiseSpeed_kts: number;
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