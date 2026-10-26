import z from "zod";
import type { MissionGenerator } from "../../MissionGenerator.interface.js";
import type { MissionGeneratorManifest } from "../../MissionGenerator.type.js";
import type { AeroflyFlightService } from "../../../core/services/AeroflyFlightService.js";
import * as ZodExtra from "../../../core/util/zExtra.js";
import { convertScenario } from "./Scenario.js";

export type HoldingPatternMissionGeneratorConfiguration = {
    navaidIdentifier: z.ZodString;
    distance_nm: z.ZodDefault<z.ZodNumber>;
    holdAltitudeMsl_ft: z.ZodDefault<z.ZodNumber>;
    inboundHeading_deg: z.ZodOptional<z.ZodNumber>;
    dmeDistance_nm: z.ZodDefault<z.ZodNumber>;
    hasEntryWaypoints: z.ZodDefault<z.ZodBoolean>;
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

The mission generator will make at least one internet request to the
Avaiation Weather Center API, so possibly this could take a few seconds
depending on API availability.
`,
            version: "1.0.0",
        };
    }

    configuration(): z.ZodObject<HoldingPatternMissionGeneratorConfiguration> {
        return z.object({
            navaidIdentifier: ZodExtra.identifier().meta({ title: "Reference RNAV / Navigational Aid" }),
            distance_nm: z.number().min(2).default(8).meta({ title: "Initial aircraft distance from fix", unit: "NM" }),
            holdAltitudeMsl_ft: z
                .number()
                .min(0)
                .default(10000)
                .meta({ title: "Holding Altitude for pattern", unit: "ft MSL" }),
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
            hasEntryWaypoints: z.boolean().default(false).meta({ title: "Add entry procedure waypoints" }),
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
    ): Promise<boolean> {
        return convertScenario(configuration, flightPlanService);
    }
}
