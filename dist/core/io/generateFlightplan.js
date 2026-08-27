export const MISSION_GENERATOR_REGISTRY = {};
export const MISSIONS_GENERATOR_MANIFESTS = Object.entries(MISSION_GENERATOR_REGISTRY).map((c) => {
    if (!c[1]) {
        throw new Error("Missing class");
    }
    return new c[1]().manifest();
});
export function getMissionGenerator(missionGeneratorSlug) {
    const missionGenerator = MISSION_GENERATOR_REGISTRY[missionGeneratorSlug];
    if (!missionGenerator) {
        throw new Error(`Unknown mission generator slug: ${missionGeneratorSlug}`);
    }
    return missionGenerator;
}
export function getMissionGeneratorZodSchema(missionGeneratorSlug) {
    const missionGenerator = getMissionGenerator(missionGeneratorSlug);
    new missionGenerator().configuration().toJSONSchema();
}
