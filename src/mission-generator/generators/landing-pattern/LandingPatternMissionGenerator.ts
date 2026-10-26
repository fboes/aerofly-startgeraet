import z from "zod";
import type { AeroflyFlightService } from "../../../core/services/AeroflyFlightService.js";
import type { MissionGenerator } from "../../MissionGenerator.interface.js";
import type { MissionGeneratorManifest } from "../../MissionGenerator.type.js";
import { convertScenario } from "./Scenario.js";

export type LandingPatternMissionGeneratorConfiguration = {
    distance_nm: z.ZodDefault<z.ZodNumber>;
    patternAltitudeAgl_ft: z.ZodDefault<z.ZodNumber>;
    minimumSafeAltitude_ft: z.ZodOptional<z.ZodNumber>;
    rightPatternRunways: z.ZodOptional<z.ZodString>;
};

export class LandingPatternMissionGenerator implements MissionGenerator<LandingPatternMissionGeneratorConfiguration> {
    manifest(): MissionGeneratorManifest {
        return {
            name: "landing-pattern",
            displayName: "Landing Pattern",
            description: "Generates a landing pattern, using the current origin, time, date and weather settings.",
            longDescription: `\
This mission generator will create a civil landing pattern flightplan at your
current origin airport, using the current weather settings to determine which
runway to use.

After completing your flight, you will be able to check if you hit the planned
pattern by looking at the recent flight log.

Your aircraft will be placed at a random location in the vicinity.
The generator will create a landing pattern at this altitude above ground level.
If in doubt, provide a minimum safe altitude to not have your aircraft spawn in terrain.
Right-hand patterns will be assumed for all runways ending with "R". You can
provide an additional list of right-hand pattern runways.

The mission generator will make at least one internet request to the
Avaiation Weather Center API, so possibly this could take a few seconds
depending on API availability.
`,
            version: "1.0.0",
        };
    }

    configuration(): z.ZodObject<LandingPatternMissionGeneratorConfiguration> {
        return z.object({
            distance_nm: z
                .number()
                .min(2)
                .default(8)
                .meta({ title: "Initial aircraft distance from airport", unit: "NM" }),
            patternAltitudeAgl_ft: z
                .number()
                .min(100)
                .default(1000)
                .meta({ title: "Pattern altitude", unit: "ft AGL" }),
            minimumSafeAltitude_ft: z.number().optional().meta({ title: "Minimum safe altitude", unit: "ft MSL" }),
            rightPatternRunways: z
                .string()
                .trim()
                .optional()
                .meta({ title: "Comma-separated list of runway names with right-turn pattern" }),
        });
    }

    async convert(
        configuration: z.infer<z.ZodObject<LandingPatternMissionGeneratorConfiguration>>,
        flightPlanService: AeroflyFlightService,
    ): Promise<boolean> {
        return convertScenario(configuration, flightPlanService);
    }
}
