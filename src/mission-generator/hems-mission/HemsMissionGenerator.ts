/* eslint-disable @typescript-eslint/no-unused-vars */

import z from "zod";
import type { MissionGenerator } from "../MissionGenerator.interface.js";
import type { MissionGeneratorManifest } from "../MissionGenerator.type.js";
import type { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";

type HemsMissionGeneratorConfiguration = {
    isEndAtHospital: z.ZodDefault<z.ZodBoolean>;
};

export class HemsMissionGenerator implements MissionGenerator<HemsMissionGeneratorConfiguration> {
    manifest(): MissionGeneratorManifest {
        return {
            name: "hems-mission",
            displayName: "Helicopter Emergency Medical Services",
            description: "Creates an emergency medical mission, using the current time, date and weather settings.",
            longDescription: `\
The mission generator will create an accident site as POI file, so your mission
target is visible.
`,
            version: "1.0.0",
        };
    }

    configuration(): z.ZodObject<HemsMissionGeneratorConfiguration> {
        return z.object({
            isEndAtHospital: z.boolean().default(false).meta({ title: "End flight at hospital" }),
        });
    }

    async convert(
        configuration: z.infer<z.ZodObject<HemsMissionGeneratorConfiguration>>,
        flightPlanService: AeroflyFlightService,
    ): Promise<void> {
        throw new Error("Not implemented yet");
    }
}
