import {
    AeroflyFlight,
    AeroflyMission,
    AeroflyMissionCheckpoint,
    AeroflyMissionConditions,
    AeroflyMissionConditionsCloud,
    AeroflyMissionsList,
} from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
import { getAeroflyAircraftByIcaoCode } from "../../services/getAeroflyAircraft.js";

export class AeroflyFlightToAeroflyCustomMissionsTmcConverter extends AeroflyFlightToStringConverter {
    static readonly fileExtension = "tmc";

    convert(flightplan: AeroflyFlight): string {
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
            return new AeroflyMissionCheckpoint(w.identifier, w.type, w.longitude, w.latitude);
        });

        const mission = new AeroflyMission(this.getFlightplanTitle(flightplan), {
            aircraft: {
                name: flightplan.aircraft.name,
                icao: getAeroflyAircraftByIcaoCode(flightplan.aircraft.name)?.icaoCode ?? "",
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
}
