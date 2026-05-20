import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
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
        distance_nm: number;
        flightTime: {
            hours: number;
            minutes: number;
        };
    };
    protected getClouds(): {
        height_ft: number;
        density: number;
    }[];
}
//# sourceMappingURL=AppState.d.ts.map
