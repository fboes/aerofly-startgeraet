import {
    type AeroflyFlight,
    AeroflyMission,
    AeroflyMissionCheckpoint,
    AeroflyMissionConditions,
    AeroflyMissionConditionsCloud,
    AeroflyMissionsList,
} from "@fboes/aerofly-custom-missions";
import { BaseAeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.base.js";
import { getAeroflyAircraftByIcaoCode } from "../../services/getAeroflyAircraft.js";
import { RoutePlanService } from "../../services/RoutePlanService.js";
import { UNIT_METER_PER_FEET } from "../../util/units.js";

export class AeroflyFlightToAeroflyCustomMissionsTmcConverter extends BaseAeroflyFlightToStringConverter {
    static readonly fileName = "Aerofly Custom Missions";
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

        let route = undefined;
        try {
            route = new RoutePlanService(flightplan).getRoute();
        } catch {
            // fail silently
        }

        const mission = new AeroflyMission(this.getFlightplanTitle(flightplan), {
            description: this.getMissionBriefing(flightplan),
            aircraft: {
                name: flightplan.aircraft.name,
                icao: getAeroflyAircraftByIcaoCode(flightplan.aircraft.name)?.icaoCode ?? "",
                livery: flightplan.aircraft.paintscheme,
            },
            fuelMass: flightplan.fuelLoadSetting.fuelMass,
            payloadMass: flightplan.fuelLoadSetting.payloadMass,
            checkpoints,
            conditions,
            distance: route?.distanceTotal_nm ? route.distanceTotal_nm * UNIT_METER_PER_FEET : undefined,
            duration: route?.estimatedTimeEnrouteTotal_min,
        });

        const customMissions = new AeroflyMissionsList([mission]);
        return customMissions.toString();
    }
}
