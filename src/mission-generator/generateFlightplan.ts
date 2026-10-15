import type { z } from "zod";
import type { MissionGenerator } from "./MissionGenerator.interface.js";
import type { MissionGeneratorManifest, MissionGeneratorManifestField } from "./MissionGenerator.type.js";
import { ErrorFormatted } from "../core/util/ErrorFormatted.js";
import { LandingPatternMissionGenerator } from "./landing-pattern/LandingPatternMissionGenerator.js";
import type { AeroflyFlightService } from "../core/services/AeroflyFlightService.js";

type ZodSchemaProperty = {
    type: string;
    title?: string;
    description?: string;
    unit?: string;
    minimum?: number;
    maximum?: number;
    default?: number | string;
};

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

export function getMissionGenerator(generatorName: string): new () => MissionGenerator<z.ZodRawShape> {
    const missionGenerator = MISSION_GENERATOR_REGISTRY[generatorName];
    if (!missionGenerator) {
        throw new ErrorFormatted(`Unknown mission generator slug: {{ generatorName }}`, {
            generatorName,
        });
    }
    return missionGenerator;
}

export function getMissionGeneratorManifest(generatorName: string): MissionGeneratorManifest {
    const missionGenerator = getMissionGenerator(generatorName);
    //const zodSchema = getMissionGeneratorZodSchema(generatorName);
    const m = new missionGenerator();

    return {
        ...m.manifest(),
        configuration: getMissionGeneratorConfiguration(m.configuration()),
    };
}

function getMissionGeneratorConfiguration(schema: z.ZodObject): MissionGeneratorManifestField[] {
    const jsonSchema = schema.toJSONSchema();
    if (!jsonSchema?.properties) {
        return [];
    }

    const fields: MissionGeneratorManifestField[] = [];
    for (const name in jsonSchema.properties) {
        const s = jsonSchema.properties[name] as ZodSchemaProperty | undefined;
        if (!s) {
            continue;
        }

        fields.push({
            name,
            label: s.title || name,
            unit: s.unit || "",
            type: s.type === "number" ? "number" : "string",
            min: s.minimum,
            max: s.maximum,
            default: s.default,
            required: jsonSchema.required?.includes(name) || false,
        });
    }
    return fields;
}

export function executeMissionGenerator(
    service: AeroflyFlightService,
    generatorName: string,
    generatorPayload: Record<string, unknown>,
): Promise<void> {
    const missionGenerator = getMissionGenerator(generatorName);
    const m = new missionGenerator();

    const ZodSchema = m.configuration();
    const configuration = ZodSchema.parse(generatorPayload);

    return m.convert(configuration, service);
}
