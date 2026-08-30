import z from "zod";
export class LandingPatternMissionGenerator {
    manifest() {
        return {
            name: "landing-pattern",
            displayName: "Landing Pattern",
            description: "Generates a landing pattern for a given airport, using the current time, date and live weather data.",
            version: "1.0.0",
        };
    }
    configuration() {
        return z.object({
            airportIcao: z.string().min(4).max(4),
        });
    }
    convert(configuration, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    flightPlanService) {
        if (!configuration.airportIcao) {
            throw new Error("Airport ICAO code is required.");
        }
    }
}
