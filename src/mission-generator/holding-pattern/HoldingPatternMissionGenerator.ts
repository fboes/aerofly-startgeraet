import z from "zod";
import type { MissionGenerator } from "../MissionGenerator.interface.js";
import type { MissionGeneratorManifest } from "../MissionGenerator.type.js";
import type { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import { getVectorString } from "../../core/formatter/getVectorString.js";
import { getFixOrNavAidCached } from "../../core/api/AviationWeatherAeroflyApi.js";
import { Point, Vector } from "@fboes/geojson";
import { UNIT_METER_PER_FEET, UNIT_METER_PER_NM } from "../../core/util/units.js";
import { randomArbitrary } from "../../core/util/random.js";
import { AeroflyNavigationConfig, AeroflyNavRouteWaypoint } from "@fboes/aerofly-custom-missions";
import type { AviationWeatherApiFix, AviationWeatherApiNavaid } from "../../core/api/AviationWeatherApi.type.js";

type HoldingPatternMissionGeneratorConfiguration = {
    navaidIdentifier: z.ZodString;
    distance_nm: z.ZodDefault<z.ZodNumber>;
    holdAltitudeMsl_ft: z.ZodDefault<z.ZodNumber>;
    inboundHeading_deg: z.ZodOptional<z.ZodNumber>;
    dmeDistance_nm: z.ZodDefault<z.ZodNumber>;
    isLeftPattern: z.ZodDefault<z.ZodBoolean>;
    isHoldingAwayPattern: z.ZodDefault<z.ZodBoolean>;
};

export class HoldingPatternMissionGenerator implements MissionGenerator<HoldingPatternMissionGeneratorConfiguration> {
    manifest(): MissionGeneratorManifest {
        return {
            name: "holding-pattern",
            displayName: "Holding Pattern",
            description: "Generates a holding pattern, using the current time, date and weather settings.",
            longDescription: `\
This mission generator will remove the current waypoints from your flightplan,
and will instead add a holding pattern fix as well as a holding pattern flight
plan.

After completing your flight, you will be able to check if you hit the planned
pattern by looking at the recent flight log.

This generator can be used to fly RNAV / VOR holding patterns, as well as
fixes being offset by a DME distance. Be sure to check for the right entry.

The mission generator will make at least one API call to an internet service,
so possibly this could take a few seconds depending on API availability.
`,
            version: "1.0.0",
        };
    }

    configuration(): z.ZodObject<HoldingPatternMissionGeneratorConfiguration> {
        return z.object({
            navaidIdentifier: z
                .string()
                .regex(/^[A-Z0-9]{2,6}$/)
                .meta({ title: "Reference RNAV / Navigational Aid" }),
            distance_nm: z.number().min(2).default(8).meta({ title: "Initial aircraft distance from fix", unit: "NM" }),
            holdAltitudeMsl_ft: z.number().min(0).default(10000).meta({ title: "Holding Altitude for pattern", unit: "ft MSL" }),
            inboundHeading_deg: z
                .number()
                .min(0)
                .max(360)
                .optional()
                .meta({ title: "Inbound heading for pattern", unit: "°" }),
            dmeDistance_nm: z
                .number()
                .min(0)
                .default(0)
                .meta({ title: "DME distance from Navigational Aid", unit: "NM" }),
            isLeftPattern: z.boolean().default(false).meta({ title: "Use left turn holding pattern" }),
            isHoldingAwayPattern: z
                .boolean()
                .default(false)
                .meta({ title: "Holding course away from the Navigational Aid" }),
        });
    }

    async convert(
        configuration: z.infer<z.ZodObject<HoldingPatternMissionGeneratorConfiguration>>,
        flightPlanService: AeroflyFlightService,
    ): Promise<void> {
        // Establish navigational aid / RNAV waypoint
        const navaidData = await getFixOrNavAidCached(configuration.navaidIdentifier);
        const navaidPoint = new Point(navaidData.lon, navaidData.lat);

        // Establish holding pattern inbound direction
        const inboundHeading = configuration.inboundHeading_deg ?? randomArbitrary(0, 360);

        // Establish fix
        const fixPoint = configuration.dmeDistance_nm
            ? navaidPoint.getPointBy(new Vector(configuration.dmeDistance_nm * UNIT_METER_PER_NM, inboundHeading))
            : navaidPoint;
        const fixData = configuration.dmeDistance_nm
            ? {
                  ...navaidData,
                  id: `${navaidData.id}+${String(configuration.dmeDistance_nm).padStart(2, "0")}`,
              }
            : navaidData;

        // Establish aircraft position
        const aircraftHeading = randomArbitrary(0, 356);
        const aircraftVector = new Vector(configuration.distance_nm * UNIT_METER_PER_NM, (aircraftHeading + 180) % 360);
        const aircraftPoint = fixPoint.getPointBy(aircraftVector);
        aircraftPoint.elevation = configuration.holdAltitudeMsl_ft * UNIT_METER_PER_FEET;

        // Add flight plan
        const departureAirport = flightPlanService.getFlightplanDepartureAirport();
        const arrivalAirport = flightPlanService.getFlightplanArrivalAirport();
        if (!departureAirport || !arrivalAirport) {
            throw new Error("No valid flight plan found to insert holding pattern into");
        }

        flightPlanService.setFlightPosition(
            aircraftPoint.longitude,
            aircraftPoint.latitude,
            aircraftPoint.elevation,
            aircraftHeading,
            undefined,
            "Cruise",
        );
        const flight = flightPlanService.getAeroflyFlight();
        flight.navigation = new AeroflyNavigationConfig(aircraftPoint.elevation, [
            departureAirport,
            ...this.getPatternWaypoints(fixData, fixPoint),
            arrivalAirport,
        ]);
        flight._missionTitle = `Holding pattern at ${navaidData.id}`;
        flight._missionBriefing = `\
Your aircraft is ${getVectorString(aircraftVector)} of ${navaidData.id}.
`;
    }

    private getPatternWaypoints(
        fixData: AviationWeatherApiNavaid | AviationWeatherApiFix,
        fixPoint: Point,
    ): AeroflyNavRouteWaypoint[] {
        const navaidFrequency_khz: undefined | number = undefined;

        return [
            new AeroflyNavRouteWaypoint(fixData.id, fixPoint.longitude, fixPoint.latitude, {
                altitude: fixPoint.elevation,
                flyOver: true,
                navaidFrequency_khz,
            }),
            // fix
            // TURN
            //  pattern.id + "-ABEAM",
            // pattern.id + "-OUTBND",
            //pattern.id + "-INBND",
            new AeroflyNavRouteWaypoint(fixData.id, fixPoint.longitude, fixPoint.latitude, {
                altitude: fixPoint.elevation,
                flyOver: true,
                navaidFrequency_khz,
            }),
        ];
    }
}
