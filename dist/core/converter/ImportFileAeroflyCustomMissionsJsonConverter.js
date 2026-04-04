import { ImportFileJSONConverter } from "./ImportFileConverter.js";
import { AeroflySettingsFuelLoad, AeroflyNavigationConfig, AeroflySettingsCloud, AeroflySettingsAircraft, AeroflySettingsWind, AeroflyTimeUtc, AeroflySettingsFlight, AeroflyNavRouteWaypoint, AeroflyNavRouteOrigin, AeroflyNavRouteDestination, AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestinationRunway, AeroflyNavRouteApproach, AeroflyNavRouteDeparture, AeroflyNavRouteArrival, } from "@fboes/aerofly-custom-missions";
export class ImportFileAeroflyCustomMissionsJsonConverter extends ImportFileJSONConverter {
    convert(content, flightplan) {
        const json = JSON.parse(content);
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
    parseFuelLoadSettings(mission) {
        const missionAircraft = this.getJSONObject(mission.aircraft);
        return new AeroflySettingsFuelLoad(this.getJSONString(missionAircraft.name), Number(mission.fuelMass ?? 0), Number(mission.payloadMass ?? 0), "Keep");
    }
    parseNavigationConfig(mission) {
        return new AeroflyNavigationConfig(0, this.parseWaypoints(mission));
    }
    parseCloudSettings(missionConditions) {
        const missionConditionsClouds = this.getJSONArray(missionConditions.clouds);
        const multiplier = 10_000 / 3.28084;
        return missionConditionsClouds.map((c) => new AeroflySettingsCloud(Number(c.cover ?? 0), Number(c.base ?? 0) / multiplier));
    }
    parseAircraftSettings(mission) {
        const missionAircraft = this.getJSONObject(mission.aircraft);
        return new AeroflySettingsAircraft(this.getJSONString(missionAircraft.name), String(missionAircraft.livery ?? ""));
    }
    parseWindSettings(missionConditions) {
        const missionConditionsWind = this.getJSONObject(missionConditions.wind);
        const w = new AeroflySettingsWind(Number(missionConditionsWind.speed ?? 0), Number(missionConditionsWind.direction ?? 0), Number(missionConditionsWind.gusts ?? 0), 0);
        w.thermalActivity = Number(missionConditions.thermalStrength ?? 0);
        return w;
    }
    parseTimeSettings(missionConditions) {
        return new AeroflyTimeUtc(new Date(String(missionConditions.time ?? "")));
    }
    parseFlightSettings(mission) {
        const missionOrigin = this.getJSONObject(mission.origin);
        return new AeroflySettingsFlight(this.getJSONNumber(missionOrigin.longitude), this.getJSONNumber(missionOrigin.latitude), Number(missionOrigin.alt ?? 0), Number(missionOrigin.dir ?? 0), 0, {
            airport: String(missionOrigin.icao ?? ""),
        });
    }
    parseWaypoints(mission) {
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
ImportFileAeroflyCustomMissionsJsonConverter.fileExtension = "aerofly.json";
