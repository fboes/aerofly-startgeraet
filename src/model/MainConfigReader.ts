import {
  AeroflyFlight,
  AeroflyNavigationConfig,
  AeroflyNavRouteApproach,
  AeroflyNavRouteArrival,
  AeroflyNavRouteDeparture,
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
import { Config } from "./Config.js";
import fs from "node:fs";
import path from "node:path";
import { AeroflyFileParser } from "./AeroflyFileParser.js";
import { AeroflyVector3Float, AeroflyMatrix3Float } from "@fboes/aerofly-custom-missions/types/node/Convert.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";

export class MainConfigReader {
  mainCfgFileName: string;

  constructor(private config: Config) {
    if (!this.config.mainMcfFilePath) {
      throw new Error("mainMcfFilePath is not defined in the config.");
    }

    if (!fs.existsSync(this.config.mainMcfFilePath)) {
      throw new Error(`The specified mainMcfFilePath does not exist: ${this.config.mainMcfFilePath}`);
    }

    this.mainCfgFileName = path.join(this.config.mainMcfFilePath, "main.mcf");
  }

  read(): AeroflyFlight {
    const mainMcfContent = fs.readFileSync(this.mainCfgFileName, "utf-8");
    return this.parseMainMcf(mainMcfContent);
  }

  parseMainMcf(mainMcfContent: string): AeroflyFlight {
    const parser = new MainConfigParser();
    return parser.parse(mainMcfContent);
  }

  write(flight: AeroflyFlight): void {
    // Open the main.mcf file
    let mainMcfContent = fs.readFileSync(this.mainCfgFileName, "utf-8");

    // Replace the appropriate sections with the data from the AeroflyFlight object
    const parser = new AeroflyFileParser();
    mainMcfContent = parser.setGroup(
      mainMcfContent,
      "tmsettings_aircraft",
      2,
      flight.aircraft.getElement().toString(2),
    );
    mainMcfContent = parser.setGroup(
      mainMcfContent,
      "tmsettings_flight",
      2,
      flight.flightSetting.getElement().toString(2),
    );
    mainMcfContent = parser.setGroup(mainMcfContent, "tm_time_utc", 2, flight.timeUtc.getElement().toString(2));
    mainMcfContent = parser.setGroup(mainMcfContent, "tmsettings_wind", 2, flight.wind.getElement().toString(2));
    mainMcfContent = parser.setGroup(mainMcfContent, "tmsettings_clouds", 2, flight.getCloudsElement().toString(2));
    mainMcfContent = parser.setGroup(
      mainMcfContent,
      "tmnavigation_config",
      2,
      flight.navigation.getElement().toString(2),
    );
    mainMcfContent = parser.setGroup(
      mainMcfContent,
      "tmsettings_fuel_load",
      2,
      flight.fuelLoadSetting.getElement().toString(2),
    );
    mainMcfContent = parser.setNumber(mainMcfContent, "visibility", flight.visibility);

    // Save the modified content back to the main.mcf file
    fs.writeFileSync(this.mainCfgFileName, mainMcfContent, "utf-8");
  }

  getFallback(): AeroflyFlight {
    return new AeroflyFlight(
      new AeroflySettingsAircraft("c172", ""),
      new AeroflySettingsFlight(-81.76, 24.5, 0, 0, 0),
      new AeroflyTimeUtc(new Date()),
      new AeroflySettingsWind(0, 0, 0),
      [],
      new AeroflyNavigationConfig(0, [
        new AeroflyNavRouteOrigin("KEYW", -81.76, 24.55),
        new AeroflyNavRouteDestination("KMIA", -80.19, 25.79),
      ]),
    );
  }
}

class MainConfigParser {
  parser = new AeroflyFileParser();

  parse(mainMcfContent: string): AeroflyFlight {
    return new AeroflyFlight(
      this.parseAircraftSettings(this.parser.getGroup(mainMcfContent, "tmsettings_aircraft")),
      this.parseFlightSettings(this.parser.getGroup(mainMcfContent, "tmsettings_flight")),
      this.parseTimeSettings(this.parser.getGroup(mainMcfContent, "tm_time_utc")),
      this.parseWindSettings(this.parser.getGroup(mainMcfContent, "tmsettings_wind")),
      this.parseCloudSettings(this.parser.getGroup(mainMcfContent, "tmsettings_clouds")),
      this.parseNavigationConfig(this.parser.getGroup(mainMcfContent, "tmnav_route", 3)),
      {
        fuelLoadSetting: this.parseFuelLoadSettings(this.parser.getGroup(mainMcfContent, "tmsettings_fuel_load")),
        visibility: this.parser.getNumber(mainMcfContent, "visibility"),
      },
    );
  }

  private parseFuelLoadSettings(tmsettings_fuel_load: string): AeroflySettingsFuelLoad | undefined {
    return new AeroflySettingsFuelLoad(
      this.parser.getValue(tmsettings_fuel_load, "aircraft"),
      this.parser.getNumber(tmsettings_fuel_load, "fuel_mass"),
      this.parser.getNumber(tmsettings_fuel_load, "payload_mass"),
    );
  }

  private parseNavigationConfig(tmnav_route: string): AeroflyNavigationConfig {
    return new AeroflyNavigationConfig(
      this.parser.getNumber(tmnav_route, "cruise_altitude"),
      this.parseWaypoints(this.parser.getGroup(tmnav_route, "pointer_list_tmnav_route_way", 4)),
    );
  }

  private parseCloudSettings(tmsettings_clouds: string): AeroflySettingsCloud[] {
    return [
      new AeroflySettingsCloud(
        this.parser.getNumber(tmsettings_clouds, "cumulus_density"),
        this.parser.getNumber(tmsettings_clouds, "cumulus_height"),
      ),
      new AeroflySettingsCloud(
        this.parser.getNumber(tmsettings_clouds, "cumulus_mediocris_density"),
        this.parser.getNumber(tmsettings_clouds, "cumulus_mediocris_height"),
      ),
      new AeroflySettingsCloud(
        this.parser.getNumber(tmsettings_clouds, "cirrus_density"),
        this.parser.getNumber(tmsettings_clouds, "cirrus_height"),
      ),
    ];
  }

  private parseAircraftSettings(tmsettings_aircraft: string): AeroflySettingsAircraft {
    return new AeroflySettingsAircraft(
      this.parser.getValue(tmsettings_aircraft, "name"),
      this.parser.getValue(tmsettings_aircraft, "paintscheme"),
    );
  }

  private parseWindSettings(tmsettings_wind: string): AeroflySettingsWind {
    return AeroflySettingsWind.createWithNormalizedValues(
      this.parser.getNumber(tmsettings_wind, "strength"),
      this.parser.getNumber(tmsettings_wind, "direction_in_degree"),
      this.parser.getNumber(tmsettings_wind, "turbulence"),
      this.parser.getNumber(tmsettings_wind, "thermal_activity"),
    );
  }

  private parseTimeSettings(tm_time_utc: string): AeroflyTimeUtc {
    return AeroflyTimeUtc.createFromComponents(
      this.parser.getNumber(tm_time_utc, "time_year"),
      this.parser.getNumber(tm_time_utc, "time_month"),
      this.parser.getNumber(tm_time_utc, "time_day"),
      this.parser.getNumber(tm_time_utc, "time_hours"),
    );
  }

  private parseFlightSettings(tmsettings_flight: string): AeroflySettingsFlight {
    return AeroflySettingsFlight.createInCartesian(
      this.parser.getNumberArray(tmsettings_flight, "position") as AeroflyVector3Float,
      this.parser.getNumberArray(tmsettings_flight, "velocity") as AeroflyVector3Float,
      this.parser.getNumberArray(tmsettings_flight, "orientation") as AeroflyMatrix3Float,
      {
        gear: this.parser.getNumber(tmsettings_flight, "gear"),
        flaps: this.parser.getNumber(tmsettings_flight, "flaps"),
        configuration: this.parser.getValue(tmsettings_flight, "configuration") as "Keep" | "OnGround" | "Cruise",
        onGround: this.parser.getBoolean(tmsettings_flight, "on_ground"),
        airport: this.parser.getValue(tmsettings_flight, "airport"),
        runway: this.parser.getValue(tmsettings_flight, "runway"),
      },
    );
  }

  private parseWaypoints(list_tmmission_checkpoint: string): AeroflyNavRouteBase[] {
    return list_tmmission_checkpoint
      .split("<[tmnav_route_")
      .slice(1)
      .map((wp) => {
        const typeMatch = wp.match(/^[^\]]+/);
        const identifier = this.parser.getValue(wp, "Identifier");
        const position = this.parser.getNumberArray(wp, "Position") as AeroflyVector3Float;
        const navaidFrequency = this.parser.getNumber(wp, "NavaidFrequency", NaN);
        const altitude = this.parser.getNumber(wp, "Altitude", NaN);
        const elevation = this.parser.getNumber(wp, "Elevation", NaN);
        const flyOver = this.parser.getBoolean(wp, "FlyOver");

        let waypoint: AeroflyNavRouteBase = new AeroflyNavRouteWaypoint(identifier, 0, 0, {
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
