import { ImportFileJSONConverter, ImportFileJSONUnvalidated } from "./ImportFileConverter.js";
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

export class ImportFileAeroflyCustomMissionsJsonConverter extends ImportFileJSONConverter {
    static readonly fileExtension = "aerofly.json";

    convert(content: string, flightplan: AeroflyFlight): void {
        const json = JSON.parse(content) as unknown;
        const data = this.getJSONArray(json);
        const mission = this.getJSONObject(data[0]);
        const missionConditions = this.getJSONObject(mission.conditions);
        flightplan.aircraft = this.parseAircraftSettings(mission);
        flightplan.flightSetting = this.parseFlightSettings(mission);
        flightplan.timeUtc = this.parseTimeSettings(missionConditions);
        flightplan.wind = this.parseWindSettings(missionConditions);
        flightplan.clouds = this.parseCloudSettings(missionConditions);
        flightplan.navigation = this.parseNavigationConfig(mission);
        flightplan.fuelLoadSetting = this.parseFuelLoadSettings(mission);
        flightplan.visibility_meter = Number(missionConditions.visibility ?? 9999);
    }

    private parseFuelLoadSettings(mission: ImportFileJSONUnvalidated): AeroflySettingsFuelLoad {
        const missionAircraft = this.getJSONObject(mission.aircraft);

        return new AeroflySettingsFuelLoad(
            this.getJSONString(missionAircraft.name),
            Number(mission.fuelMass ?? 0),
            Number(mission.payloadMass ?? 0),
            "Keep",
        );
    }

    private parseNavigationConfig(mission: ImportFileJSONUnvalidated): AeroflyNavigationConfig {
        return new AeroflyNavigationConfig(0, this.parseWaypoints(mission));
    }

    private parseCloudSettings(missionConditions: ImportFileJSONUnvalidated): AeroflySettingsCloud[] {
        const missionConditionsClouds = this.getJSONArray(missionConditions.clouds);
        const multiplier = 10_000 / 3.28084;

        return missionConditionsClouds.map(
            (c) => new AeroflySettingsCloud(Number(c.cover ?? 0), Number(c.base ?? 0) / multiplier),
        );
    }

    private parseAircraftSettings(mission: ImportFileJSONUnvalidated): AeroflySettingsAircraft {
        const missionAircraft = this.getJSONObject(mission.aircraft);

        return new AeroflySettingsAircraft(
            this.getJSONString(missionAircraft.name),
            String(missionAircraft.livery ?? ""),
        );
    }

    private parseWindSettings(missionConditions: ImportFileJSONUnvalidated): AeroflySettingsWind {
        const missionConditionsWind = this.getJSONObject(missionConditions.wind);

        const w = new AeroflySettingsWind(
            Number(missionConditionsWind.speed ?? 0),
            Number(missionConditionsWind.direction ?? 0),
            Number(missionConditionsWind.gusts ?? 0),
            0,
        );
        w.thermalActivity = Number(missionConditions.thermalStrength ?? 0);
        return w;
    }

    private parseTimeSettings(missionConditions: ImportFileJSONUnvalidated): AeroflyTimeUtc {
        return new AeroflyTimeUtc(new Date(String(missionConditions.time ?? "")));
    }

    private parseFlightSettings(mission: ImportFileJSONUnvalidated): AeroflySettingsFlight {
        const missionOrigin = this.getJSONObject(mission.origin);

        return new AeroflySettingsFlight(
            this.getJSONNumber(missionOrigin.longitude),
            this.getJSONNumber(missionOrigin.latitude),
            Number(missionOrigin.alt ?? 0),
            Number(missionOrigin.dir ?? 0),
            0,
            {
                airport: String(missionOrigin.icao ?? ""),
            },
        );
    }

    private parseWaypoints(mission: ImportFileJSONUnvalidated): AeroflyNavRouteBase[] {
        const missionCheckpoints = this.getJSONArray(mission.checkpoints);

        return missionCheckpoints.map((wp) => {
            const type = this.getJSONString(wp.type);
            const name = this.getJSONString(wp.name);
            const longitude = this.getJSONNumber(wp.longitude);
            const latitude = this.getJSONNumber(wp.latitude);
            const navaidFrequency = wp.frequency ? Number(wp.frequency) : NaN;
            const altitude = wp.altitude ? Number(wp.altitude) : NaN;
            const flyOver = Boolean(wp.fly_over ?? false);

            switch (type) {
                case "origin":
                    return new AeroflyNavRouteOrigin(name, longitude, latitude, {
                        elevation: isNaN(altitude) ? null : altitude,
                    });
                case "destination":
                    return new AeroflyNavRouteDestination(name, longitude, latitude, {
                        elevation: isNaN(altitude) ? null : altitude,
                    });
                case "departure_runway":
                    return new AeroflyNavRouteDepartureRunway(name, longitude, latitude, {
                        elevation: isNaN(altitude) ? null : altitude,
                    });
                case "destination_runway":
                    return new AeroflyNavRouteDestinationRunway(name, longitude, latitude, {
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
                    return new AeroflyNavRouteWaypoint(name, longitude, latitude, {
                        navaidFrequency: isNaN(navaidFrequency) ? null : navaidFrequency,
                        altitude: isNaN(altitude) ? null : altitude,
                        flyOver,
                    });
            }
        });
    }
}
