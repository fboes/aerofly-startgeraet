import z from "zod";
import type { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import type { MissionGeneratorInterface, MissionGeneratorManifest } from "../MissionGeneratorInterface.js";

type LandingPatternMissionGeneratorConfiguration = {
    distance_nm: z.ZodDefault<z.ZodNumber>;
};

export class LandingPatternMissionGenerator implements MissionGeneratorInterface<LandingPatternMissionGeneratorConfiguration> {
    manifest(): MissionGeneratorManifest {
        return {
            name: "landing-pattern",
            displayName: "Landing Pattern",
            description: "Generates a landing pattern, using the current destination, time, date and weather settings.",
            version: "1.0.0",
        };
    }

    configuration(): z.ZodObject<LandingPatternMissionGeneratorConfiguration> {
        return z.object({
            distance_nm: z
                .number()
                .positive()
                .default(5)
                .describe("Distance from the airport in nautical miles for the landing pattern."),
        });
    }

    convert(
        configuration: z.infer<z.ZodObject<LandingPatternMissionGeneratorConfiguration>>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        flightPlanService: AeroflyFlightService,
    ): void {
        if (configuration.distance_nm <= 0) {
            throw new Error("Distance in nautical miles must be a positive number.");
        }
    }
}
