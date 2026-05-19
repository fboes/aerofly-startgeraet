import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class AeroflyFlightBridge {
    readonly aeroflyFlight: AeroflyFlight;
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
    constructor(aeroflyFlight: AeroflyFlight);
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
}
//# sourceMappingURL=AeroflyFlightBridge.d.ts.map