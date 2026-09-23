import {
    AeroflyFlight,
    AeroflyNavigationConfig,
    AeroflyNavRouteDestination,
    AeroflyNavRouteOrigin,
    AeroflySettingsAircraft,
    AeroflySettingsFlight,
    AeroflySettingsWind,
    AeroflyTimeUtc,
} from "@fboes/aerofly-custom-missions";

/**
 * `AeroflyFlight` class with default flight plan
 */
export class AeroflyFlightFallback extends AeroflyFlight {
    constructor() {
        super(
            new AeroflySettingsAircraft("c172", ""),
            new AeroflySettingsFlight(-81.76, 24.5, 0, 0, 0),
            new AeroflyTimeUtc(new Date()),
            new AeroflySettingsWind(0, 0, 0),
            [],
            new AeroflyNavigationConfig(0, [
                new AeroflyNavRouteOrigin("KEYW", -81.759956, 24.556119, {
                    elevation_ft: 3,
                }),
                new AeroflyNavRouteDestination("KMIA", -80.290117, 25.795361, {
                    elevation_ft: 9,
                }),
            ]),
        );
    }
}
