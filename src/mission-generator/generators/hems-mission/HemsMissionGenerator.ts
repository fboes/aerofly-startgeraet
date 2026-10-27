import z from "zod";
import type { MissionGenerator } from "../../MissionGenerator.interface.js";
import type { MissionGeneratorManifest } from "../../MissionGenerator.type.js";
import type { AeroflyFlightService } from "../../../core/services/AeroflyFlightService.js";
import { convertScenario } from "./Scenario.js";

export type HemsMissionGeneratorConfiguration = {
    minRange_km: z.ZodDefault<z.ZodNumber>;
    maxRange_km: z.ZodDefault<z.ZodNumber>;
    isColdAndDark: z.ZodDefault<z.ZodBoolean>;
};

export class HemsMissionGenerator implements MissionGenerator<HemsMissionGeneratorConfiguration> {
    manifest(): MissionGeneratorManifest {
        return {
            name: "hems-mission",
            displayName: "Helicopter Emergency Medical Services",
            description: "Creates an emergency medical mission, using the current time, date and weather settings.",
            longDescription: `\
This mission generator will create a new flight plan, starting at your current
origin airport. You will have to fly to an emergency site in the vicinity, and
bring a patient you will pick up there to a nearby hospital.

A collection of emergency sites the generator will taken from a GeoJSON file
stored in the \`startgeraet\` directory of your Aerofly FS user folder.
If this file does not exist, the generator will take some time setting it up.

The mission generator will create an accident site as POI file, so your mission
target is visible.
`,
            version: "1.0.0",
        };
    }

    configuration(): z.ZodObject<HemsMissionGeneratorConfiguration> {
        return z.object({
            minRange_km: z.number().min(0).max(99).default(5).meta({ title: "Minimum distance", unit: "km" }),
            maxRange_km: z.number().min(0).max(99).default(60).meta({ title: "Maximum distance", unit: "km" }),
            isColdAndDark: z.boolean().default(false).meta({ title: "Start cold & dark" }),
        });
    }

    async convert(
        configuration: z.infer<z.ZodObject<HemsMissionGeneratorConfiguration>>,
        flightPlanService: AeroflyFlightService,
    ): Promise<boolean> {
        return convertScenario(configuration, flightPlanService);
    }
}
