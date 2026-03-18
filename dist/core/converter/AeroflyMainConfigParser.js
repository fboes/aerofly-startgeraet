import { AeroflyFlight, AeroflySettingsFuelLoad, AeroflyNavigationConfig, AeroflySettingsCloud, AeroflySettingsAircraft, AeroflySettingsWind, AeroflyTimeUtc, AeroflySettingsFlight, AeroflyNavRouteWaypoint, AeroflyNavRouteOrigin, AeroflyNavRouteDestination, AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestinationRunway, AeroflyNavRouteApproach, AeroflyNavRouteDeparture, AeroflyNavRouteArrival, } from "@fboes/aerofly-custom-missions";
import { AeroflyFileParser } from "./AeroflyFileParser.js";
export class AeroflyMainConfigParser {
    constructor() {
        this.parser = new AeroflyFileParser();
    }
    parse(mainMcfContent) {
        return new AeroflyFlight(this.parseAircraftSettings(this.parser.getGroup(mainMcfContent, "tmsettings_aircraft")), this.parseFlightSettings(this.parser.getGroup(mainMcfContent, "tmsettings_flight")), this.parseTimeSettings(this.parser.getGroup(mainMcfContent, "tm_time_utc")), this.parseWindSettings(this.parser.getGroup(mainMcfContent, "tmsettings_wind")), this.parseCloudSettings(this.parser.getGroup(mainMcfContent, "tmsettings_clouds")), this.parseNavigationConfig(this.parser.getGroup(mainMcfContent, "tmnav_route", 3)), {
            fuelLoadSetting: this.parseFuelLoadSettings(this.parser.getGroup(mainMcfContent, "tmsettings_fuel_load")),
            visibility: this.parser.getNumber(mainMcfContent, "visibility"),
        });
    }
    parseFuelLoadSettings(tmsettings_fuel_load) {
        return new AeroflySettingsFuelLoad(this.parser.getValue(tmsettings_fuel_load, "aircraft"), this.parser.getNumber(tmsettings_fuel_load, "fuel_mass"), this.parser.getNumber(tmsettings_fuel_load, "payload_mass"));
    }
    parseNavigationConfig(tmnav_route) {
        return new AeroflyNavigationConfig(this.parser.getNumber(tmnav_route, "cruise_altitude"), this.parseWaypoints(this.parser.getGroup(tmnav_route, "pointer_list_tmnav_route_way", 4)));
    }
    parseCloudSettings(tmsettings_clouds) {
        return [
            new AeroflySettingsCloud(this.parser.getNumber(tmsettings_clouds, "cumulus_density"), this.parser.getNumber(tmsettings_clouds, "cumulus_height")),
            new AeroflySettingsCloud(this.parser.getNumber(tmsettings_clouds, "cumulus_mediocris_density"), this.parser.getNumber(tmsettings_clouds, "cumulus_mediocris_height")),
            new AeroflySettingsCloud(this.parser.getNumber(tmsettings_clouds, "cirrus_density"), this.parser.getNumber(tmsettings_clouds, "cirrus_height")),
        ];
    }
    parseAircraftSettings(tmsettings_aircraft) {
        return new AeroflySettingsAircraft(this.parser.getValue(tmsettings_aircraft, "name"), this.parser.getValue(tmsettings_aircraft, "paintscheme"));
    }
    parseWindSettings(tmsettings_wind) {
        return AeroflySettingsWind.createWithNormalizedValues(this.parser.getNumber(tmsettings_wind, "strength"), this.parser.getNumber(tmsettings_wind, "direction_in_degree"), this.parser.getNumber(tmsettings_wind, "turbulence"), this.parser.getNumber(tmsettings_wind, "thermal_activity"));
    }
    parseTimeSettings(tm_time_utc) {
        return AeroflyTimeUtc.createFromComponents(this.parser.getNumber(tm_time_utc, "time_year"), this.parser.getNumber(tm_time_utc, "time_month"), this.parser.getNumber(tm_time_utc, "time_day"), this.parser.getNumber(tm_time_utc, "time_hours"));
    }
    parseFlightSettings(tmsettings_flight) {
        return AeroflySettingsFlight.createInCartesian(this.parser.getNumberArray(tmsettings_flight, "position"), this.parser.getNumberArray(tmsettings_flight, "velocity"), this.parser.getNumberArray(tmsettings_flight, "orientation"), {
            gear: this.parser.getNumber(tmsettings_flight, "gear"),
            flaps: this.parser.getNumber(tmsettings_flight, "flaps"),
            configuration: this.parser.getValue(tmsettings_flight, "configuration"),
            onGround: this.parser.getBoolean(tmsettings_flight, "on_ground"),
            airport: this.parser.getValue(tmsettings_flight, "airport"),
            runway: this.parser.getValue(tmsettings_flight, "runway"),
        });
    }
    parseWaypoints(list_tmmission_checkpoint) {
        return list_tmmission_checkpoint
            .split("<[tmnav_route_")
            .slice(1)
            .map((wp) => {
            const typeMatch = wp.match(/^[^\]]+/);
            const identifier = this.parser.getValue(wp, "Identifier");
            const position = this.parser.getNumberArray(wp, "Position");
            const navaidFrequency = this.parser.getNumber(wp, "NavaidFrequency", NaN);
            const altitude = this.parser.getNumber(wp, "Altitude", NaN);
            const elevation = this.parser.getNumber(wp, "Elevation", NaN);
            const flyOver = this.parser.getBoolean(wp, "FlyOver");
            let waypoint = new AeroflyNavRouteWaypoint(identifier, 0, 0, {
                navaidFrequency: isNaN(navaidFrequency) ? null : navaidFrequency,
                altitude: isNaN(altitude) ? null : altitude,
                flyOver,
            });
            let setPosition = true;
            switch (typeMatch ? String(typeMatch[0]) : "waypoint") {
                case "origin":
                    waypoint = new AeroflyNavRouteOrigin(identifier, 0, 0, {
                        elevation: isNaN(elevation) ? null : elevation,
                    });
                    break;
                case "destination":
                    waypoint = new AeroflyNavRouteDestination(identifier, 0, 0, {
                        elevation: isNaN(elevation) ? null : elevation,
                    });
                    break;
                case "departure_runway":
                    waypoint = new AeroflyNavRouteDepartureRunway(identifier, 0, 0, {
                        elevation: isNaN(elevation) ? null : elevation,
                    });
                    break;
                case "destination_runway":
                    waypoint = new AeroflyNavRouteDestinationRunway(identifier, 0, 0, {
                        elevation: isNaN(elevation) ? null : elevation,
                    });
                    break;
                case "approach":
                    waypoint = new AeroflyNavRouteApproach(identifier, "", {
                        elevation: isNaN(elevation) ? null : elevation,
                    });
                    setPosition = false;
                    break;
                case "departure":
                    waypoint = new AeroflyNavRouteDeparture(identifier, "", {
                        elevation: isNaN(elevation) ? null : elevation,
                    });
                    setPosition = false;
                    break;
                case "arrival":
                    waypoint = new AeroflyNavRouteArrival(identifier, "", {
                        elevation: isNaN(elevation) ? null : elevation,
                    });
                    setPosition = false;
                    break;
            }
            return setPosition ? waypoint.setPosition(position) : waypoint;
        });
    }
}
