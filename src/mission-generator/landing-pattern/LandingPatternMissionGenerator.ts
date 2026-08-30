import z from "zod";
import type { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import type { MissionGeneratorInterface, MissionGeneratorManifest } from "../MissionGeneratorInterface.js";

type LandingPatternMissionGeneratorConfiguration = {
    airportIcao: z.ZodString;
};

export class LandingPatternMissionGenerator implements MissionGeneratorInterface<LandingPatternMissionGeneratorConfiguration> {
    manifest(): MissionGeneratorManifest {
        return {
            name: "landing-pattern",
            displayName: "Landing Pattern",
            description:
                "Generates a landing pattern for a given airport, using the current time, date and live weather data.",
            version: "1.0.0",
        };
    }

    configuration(): z.ZodObject<LandingPatternMissionGeneratorConfiguration> {
        return z.object({
            airportIcao: z.string().min(4).max(4),
        });
    }

    convert(
        configuration: z.infer<z.ZodObject<LandingPatternMissionGeneratorConfiguration>>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        flightPlanService: AeroflyFlightService,
    ): void {
        if (!configuration.airportIcao) {
            throw new Error("Airport ICAO code is required.");
        }
    }
}
