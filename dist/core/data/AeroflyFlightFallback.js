import { AeroflyFlight, AeroflyNavigationConfig, AeroflyNavRouteDestination, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, AeroflySettingsAircraft, AeroflySettingsFlight, AeroflySettingsWind, AeroflyTimeUtc, } from "@fboes/aerofly-custom-missions";
/**
 * `AeroflyFlight` class with default flight plan
 */
export class AeroflyFlightFallback extends AeroflyFlight {
    constructor(addDemoWaypoints = false) {
        const demoWaypoints = addDemoWaypoints
            ? [
                new AeroflyNavRouteWaypoint("MTH", -81.051417, 24.726286, {
                    altitude_ft: 8000,
                }),
                new AeroflyNavRouteWaypoint("MNATE", -80.524028, 24.979317, {
                    altitude_ft: 8000,
                }),
                new AeroflyNavRouteWaypoint("HST", -80.379414, 25.489981, {
                    altitude_ft: 8000,
                    navaidFrequency_mhz: 108.2,
                }),
            ]
            : [];
        super(new AeroflySettingsAircraft("c172", ""), new AeroflySettingsFlight(-81.76, 24.5, 0, 0, 0), new AeroflyTimeUtc(new Date()), new AeroflySettingsWind(0, 0, 0), [], new AeroflyNavigationConfig(demoWaypoints[0]?.altitude ?? 0, [
            new AeroflyNavRouteOrigin("KEYW", -81.759956, 24.556119, {
                elevation_ft: 3,
            }),
            ...demoWaypoints,
            new AeroflyNavRouteDestination("KMIA", -80.290117, 25.795361, {
                elevation_ft: 9,
            }),
        ]));
    }
}
