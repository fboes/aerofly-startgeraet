import type { z } from "zod";
import type { MissionGenerator, MissionGeneratorManifest } from "./MissionGenerator.interface.js";
import { ErrorFormatted } from "../core/util/ErrorFormatted.js";
import { LandingPatternMissionGenerator } from "./landing-pattern/LandingPatternMissionGenerator.js";
import type { AeroflyFlightService } from "../core/services/AeroflyFlightService.js";

export const MISSION_GENERATOR_REGISTRY: Record<string, (new () => MissionGenerator<z.ZodRawShape>) | undefined> = {
    "landing-pattern": LandingPatternMissionGenerator,
};

export const MISSIONS_GENERATOR_MANIFESTS: MissionGeneratorManifest[] = Object.entries(MISSION_GENERATOR_REGISTRY).map(
    (c) => {
        if (!c[1]) {
            throw new Error("Missing class");
        }
        return new c[1]().manifest();
    },
);

export function getMissionGenerator(missionGeneratorSlug: string): new () => MissionGenerator<z.ZodRawShape> {
    const missionGenerator = MISSION_GENERATOR_REGISTRY[missionGeneratorSlug];
    if (!missionGenerator) {
        throw new ErrorFormatted(`Unknown mission generator slug: {{ missionGeneratorSlug }}`, {
            missionGeneratorSlug,
        });
    }
    return missionGenerator;
}

export function getMissionGeneratorZodSchema(missionGeneratorSlug: string) {
    const missionGenerator = getMissionGenerator(missionGeneratorSlug);
    new missionGenerator().configuration().toJSONSchema();
}

export function executeMissionGenerator(
    service: AeroflyFlightService,
    generatorName: string,
    generatorPayload: Record<string, unknown>,
): Promise<void> {
    const missionGenerator = MISSION_GENERATOR_REGISTRY[generatorName];
    if (!missionGenerator) {
        throw new ErrorFormatted(`Unknown mission generator slug: {{ generatorName }}`, {
            generatorName,
        });
    }

    const m = new missionGenerator();

    const ZodSchema = m.configuration();
    const configuration = ZodSchema.parse(generatorPayload);

    return m.convert(configuration, service);
}
