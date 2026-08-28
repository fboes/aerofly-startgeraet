import type { z } from "zod";
import type { MissionGeneratorInterface, MissionGeneratorManifest } from "./MissionGeneratorInterface.js";

export const MISSION_GENERATOR_REGISTRY: Record<
    string,
    (new () => MissionGeneratorInterface<z.ZodRawShape>) | undefined
> = {};

export const MISSIONS_GENERATOR_MANIFESTS: MissionGeneratorManifest[] = Object.entries(MISSION_GENERATOR_REGISTRY).map(
    (c) => {
        if (!c[1]) {
            throw new Error("Missing class");
        }
        return new c[1]().manifest();
    },
);

export function getMissionGenerator(missionGeneratorSlug: string): new () => MissionGeneratorInterface<z.ZodRawShape> {
    const missionGenerator = MISSION_GENERATOR_REGISTRY[missionGeneratorSlug];
    if (!missionGenerator) {
        throw new Error(`Unknown mission generator slug: ${missionGeneratorSlug}`);
    }
    return missionGenerator;
}

export function getMissionGeneratorZodSchema(missionGeneratorSlug: string) {
    const missionGenerator = getMissionGenerator(missionGeneratorSlug);
    new missionGenerator().configuration().toJSONSchema();
}
