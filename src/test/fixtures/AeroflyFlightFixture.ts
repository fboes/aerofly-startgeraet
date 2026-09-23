import {
    AeroflyFlight,
    AeroflyNavigationConfig,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
    AeroflySettingsAircraft,
    AeroflySettingsCloud,
    AeroflySettingsFlight,
    AeroflySettingsFuelLoad,
    AeroflySettingsWind,
    AeroflyTimeUtc,
} from "@fboes/aerofly-custom-missions";

/**
 * `AeroflyFlight` class with default flight plan
 */
export class AeroflyFlightFixture extends AeroflyFlight {
    constructor() {
        super(
            new AeroflySettingsAircraft("c172", ""),
            new AeroflySettingsFlight(-81.76, 24.5, 0, 0, 0),
            new AeroflyTimeUtc(new Date("2026-09-23T12:00:00Z")),
            new AeroflySettingsWind(5, 33, 10, 21),
            [
                AeroflySettingsCloud.createInFeet(0.5, 1000),
                AeroflySettingsCloud.createInFeet(0.6, 2000),
                AeroflySettingsCloud.createInFeet(0.9, 1500),
            ],
            AeroflyNavigationConfig.createInFeet(8000, [
                new AeroflyNavRouteOrigin("KEYW", -81.759956, 24.556119, {
                    elevation_ft: 3,
                }),
                new AeroflyNavRouteDepartureRunway("09", -81.759956, 24.556119, {
                    elevation_ft: 3,
                    direction_degree: 89,
                    runwayLength: 1547,
                }),
                new AeroflyNavRouteWaypoint("KMTH", -81.051417, 24.726286, {
                    altitude_ft: 8000,
                }),
                new AeroflyNavRouteWaypoint("MNATE", -80.524028, 24.979317, {
                    altitude_ft: 8000,
                }),
                new AeroflyNavRouteWaypoint("HST", -80.379414, 25.489981, {
                    altitude_ft: 8000,
                    navaidFrequency_mhz: 108.2,
                }),
                new AeroflyNavRouteDestinationRunway("09", -80.290117, 25.795361, {
                    elevation_ft: 8,
                    direction_degree: 87,
                    runwayLength: 3967,
                }),
                new AeroflyNavRouteDestination("KMIA", -80.290117, 25.795361, {
                    elevation_ft: 9,
                }),
            ]),
            {
                fuelLoadSetting: new AeroflySettingsFuelLoad("c172", 50, 90),
                visibility_sm: 9.5,
                _missionTitle: "Fixture flight Key West to Miami",
            },
        );
    }
}
