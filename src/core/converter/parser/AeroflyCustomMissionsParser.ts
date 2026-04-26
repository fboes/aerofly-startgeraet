import {
    AeroflyFlight,
    AeroflySettingsFuelLoad,
    AeroflyNavigationConfig,
    AeroflySettingsCloud,
    AeroflySettingsAircraft,
    AeroflySettingsWind,
    AeroflyTimeUtc,
    AeroflySettingsFlight,
    AeroflyNavRouteWaypoint,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteApproach,
    AeroflyNavRouteDeparture,
    AeroflyNavRouteArrival,
} from "@fboes/aerofly-custom-missions";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
import { AeroflyFileParser } from "./AeroflyFileParser.js";

export class AeroflyCustomMissionsParser {
    parser = new AeroflyFileParser();

    getMissionNames(content: string): string[] {
        const missions = this.getMissions(content);
        return missions.map((mission) => {
            return this.parser.getValue(mission, "title");
        });
    }

    parse(content: string, index = 0): AeroflyFlight {
        const missions = this.getMissions(content);
        const mission = missions.at(index);
        if (mission == undefined) {
            throw new Error("Invalid mission index");
        }
        const missionConditions = this.parser.getGroup(mission, "tmmission_conditions", 4);
        const missionTime = this.parser.getGroup(missionConditions, "tm_time_utc", 5);

        return new AeroflyFlight(
            this.parseAircraftSettings(mission),
            this.parseFlightSettings(mission),
            this.parseTimeSettings(missionTime),
            this.parseWindSettings(missionConditions),
            this.parseCloudSettings(missionConditions),
            this.parseNavigationConfig(mission),
            {
                fuelLoadSetting: this.parseFuelLoadSettings(mission),
                visibility_meter: this.parser.getNumber(missionConditions, "visibility"),
            },
        );
    }

    private getMissions(content: string): string[] {
        return content.split("<[tmmission_definition]").slice(1);
    }

    private parseFuelLoadSettings(mission: string): AeroflySettingsFuelLoad | undefined {
        return new AeroflySettingsFuelLoad(
            this.parser.getValue(mission, "aircraft_name"),
            this.parser.getNumber(mission, "fuel_mass"),
            this.parser.getNumber(mission, "payload_mass"),
            "Keep",
        );
    }

    private parseNavigationConfig(mission: string): AeroflyNavigationConfig {
        const missionCheckpoints = this.parser.getGroup(mission, "list_tmmission_checkpoint", 4);

        return new AeroflyNavigationConfig(0, this.parseWaypoints(missionCheckpoints));
    }

    private parseCloudSettings(missionConditions: string): AeroflySettingsCloud[] {
        const multiplier = 10_000 / 3.28084;
        return [
            new AeroflySettingsCloud(
                this.parser.getNumber(missionConditions, "cloud_cover"),
                this.parser.getNumber(missionConditions, "cloud_base") / multiplier,
            ),
            new AeroflySettingsCloud(
                this.parser.getNumber(missionConditions, "cirrus_cover"),
                this.parser.getNumber(missionConditions, "cirrus_base") / multiplier,
            ),
            new AeroflySettingsCloud(
                this.parser.getNumber(missionConditions, "cumulus_mediocris_cover"),
                this.parser.getNumber(missionConditions, "cumulus_mediocris_base") / multiplier,
            ),
        ];
    }

    private parseAircraftSettings(mission: string): AeroflySettingsAircraft {
        return new AeroflySettingsAircraft(
            this.parser.getValue(mission, "aircraft_name"),
            this.parser.getValue(mission, "aircraft_livery"),
        );
    }

    private parseWindSettings(missionConditions: string): AeroflySettingsWind {
        const w = new AeroflySettingsWind(
            this.parser.getNumber(missionConditions, "wind_speed"),
            this.parser.getNumber(missionConditions, "wind_direction"),
            this.parser.getNumber(missionConditions, "wind_gusts"),
            0,
        );
        w.thermalActivity = this.parser.getNumber(missionConditions, "thermal_strength");
        return w;
    }

    private parseTimeSettings(mission: string): AeroflyTimeUtc {
        return AeroflyTimeUtc.createFromComponents(
            this.parser.getNumber(mission, "time_year"),
            this.parser.getNumber(mission, "time_month"),
            this.parser.getNumber(mission, "time_day"),
            this.parser.getNumber(mission, "time_hours"),
        );
    }

    private parseFlightSettings(mission: string): AeroflySettingsFlight {
        const position = this.parser.getNumberArray(mission, "origin_lon_lat");

        return new AeroflySettingsFlight(
            position[0],
            position[1],
            this.parser.getNumber(mission, "origin_alt"),
            this.parser.getNumber(mission, "origin_dir"),
        );
    }

    private parseWaypoints(missionCheckpoints: string): AeroflyNavRouteBase[] {
        return missionCheckpoints
            .split("<[tmmission_checkpoint")
            .slice(1)
            .map((wp) => {
                const type = this.parser.getValue(wp, "type");
                const name = this.parser.getValue(wp, "name");
                const position = this.parser.getNumberArray(wp, "lon_lat");
                const navaidFrequency = this.parser.getNumber(wp, "frequency", NaN);
                const altitude = this.parser.getNumber(wp, "altitude", NaN);
                const flyOver = this.parser.getBoolean(wp, "fly_over");

                switch (type) {
                    case "origin":
                        return new AeroflyNavRouteOrigin(name, position[0] ?? 0, position[1] ?? 0, {
                            elevation: isNaN(altitude) ? null : altitude,
                        });
                    case "destination":
                        return new AeroflyNavRouteDestination(name, position[0] ?? 0, position[1] ?? 0, {
                            elevation: isNaN(altitude) ? null : altitude,
                        });
                    case "departure_runway":
                        return new AeroflyNavRouteDepartureRunway(name, position[0] ?? 0, position[1] ?? 0, {
                            elevation: isNaN(altitude) ? null : altitude,
                        });
                    case "destination_runway":
                        return new AeroflyNavRouteDestinationRunway(name, position[0] ?? 0, position[1] ?? 0, {
                            elevation: isNaN(altitude) ? null : altitude,
                        });
                    case "approach":
                        return new AeroflyNavRouteApproach(name, "", {
                            elevation: isNaN(altitude) ? null : altitude,
                        });
                    case "departure":
                        return new AeroflyNavRouteDeparture(name, "", {
                            elevation: isNaN(altitude) ? null : altitude,
                        });
                    case "arrival":
                        return new AeroflyNavRouteArrival(name, "", {
                            elevation: isNaN(altitude) ? null : altitude,
                        });
                    default:
                        return new AeroflyNavRouteWaypoint(name, position[0] ?? 0, position[1] ?? 0, {
                            navaidFrequency: isNaN(navaidFrequency) ? null : navaidFrequency,
                            altitude: isNaN(altitude) ? null : altitude,
                            flyOver,
                        });
                }
            });
    }
}
