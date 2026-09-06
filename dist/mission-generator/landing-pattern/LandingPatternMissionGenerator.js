import z from "zod";
export class LandingPatternMissionGenerator {
    manifest() {
        return {
            name: "landing-pattern",
            displayName: "Landing Pattern",
            description: "Generates a landing pattern, using the current destination, time, date and weather settings.",
            version: "1.0.0",
        };
    }
    configuration() {
        return z.object({
            distance_nm: z
                .number()
                .positive()
                .default(5)
                .describe("Distance from the airport in nautical miles for the landing pattern."),
        });
    }
    convert(configuration, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    flightPlanService) {
        if (configuration.distance_nm <= 0) {
            throw new Error("Distance in nautical miles must be a positive number.");
        }
    }
}
