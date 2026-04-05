import { AeroflyMission, AeroflyMissionCheckpoint, AeroflyMissionConditions, AeroflyMissionConditionsCloud, AeroflyMissionsList, AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteDestinationRunway, AeroflyNavRouteOrigin, } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraftService } from "../services/AeroflyAircraftService.js";
export class ExportFileAeroflyCustomMissionsTmcConverter {
    static fileExtension = "tmc";
    convert(flightplan) {
        // Build time and weather
        const conditions = new AeroflyMissionConditions({
            time: flightplan.timeUtc.time,
            wind: {
                direction: flightplan.wind.directionInDegree,
                speed: flightplan.wind.speed_kts,
                gusts: flightplan.wind.gust_kts,
            },
            visibility: flightplan.visibility_meter,
            clouds: flightplan.clouds.map((c) => {
                return new AeroflyMissionConditionsCloud(c.density, c.height);
            }),
        });
        // Build checkpoints
        const checkpoints = flightplan.navigation.waypoints.map((w) => {
            return new AeroflyMissionCheckpoint(w.identifier, this.getWaypointType(w), w.longitude, w.latitude);
        });
        const mission = new AeroflyMission(`From ${flightplan.navigation.waypoints[0]?.identifier} to ${flightplan.navigation.waypoints[flightplan.navigation.waypoints.length - 1]?.identifier}`, {
            aircraft: {
                name: flightplan.aircraft.name,
                icao: AeroflyAircraftService.getAircraftByIcaoCode(flightplan.aircraft.name)?.icaoCode ?? "",
                livery: flightplan.aircraft.paintscheme,
            },
            fuelMass: flightplan.fuelLoadSetting.fuelMass,
            payloadMass: flightplan.fuelLoadSetting.payloadMass,
            checkpoints,
            conditions,
        });
        const customMissions = new AeroflyMissionsList([mission]);
        return customMissions.toString();
    }
    getWaypointType(w) {
        switch (w.constructor) {
            case AeroflyNavRouteOrigin:
                return "origin";
            case AeroflyNavRouteDestination:
                return "destination";
            case AeroflyNavRouteDepartureRunway:
                return "departure_runway";
            case AeroflyNavRouteDestinationRunway:
                return "destination_runway";
            default:
                return "waypoint";
        }
    }
}
