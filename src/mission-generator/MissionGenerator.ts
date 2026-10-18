import type { z } from "zod";
import type { MissionGenerator } from "./MissionGenerator.interface.js";
import type { MissionGeneratorManifest, MissionGeneratorManifestField } from "./MissionGenerator.type.js";
import { ErrorFormatted } from "../core/util/ErrorFormatted.js";
import { LandingPatternMissionGenerator } from "./landing-pattern/LandingPatternMissionGenerator.js";
import type { AeroflyFlightService } from "../core/services/AeroflyFlightService.js";
import type { JsonSchemaObject, JsonSchemaType } from "./JsonSchema.type.js";
import { HoldingPatternMissionGenerator } from "./holding-pattern/HoldingPatternMissionGenerator.js";
//import { HemsMissionGenerator } from "./hems-mission/HemsMissionGenerator.js";

export const MISSION_GENERATOR_REGISTRY: Record<string, (new () => MissionGenerator<z.ZodRawShape>) | undefined> = {
    "landing-pattern": LandingPatternMissionGenerator,
    "holding-pattern": HoldingPatternMissionGenerator,
    //"hems-mission": HemsMissionGenerator,
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
    const m = new missionGenerator();

    return {
        ...m.manifest(),
        configuration: getMissionGeneratorConfiguration(m.configuration()),
    };
}

function getMissionGeneratorConfiguration(schema: z.ZodObject): MissionGeneratorManifestField[] {
    const jsonSchema = schema.toJSONSchema() as JsonSchemaObject;
    if (!jsonSchema?.properties) {
        return [];
    }

    const fields: MissionGeneratorManifestField[] = [];
    for (const name in jsonSchema.properties) {
        const s = jsonSchema.properties[name];
        if (!s) {
            continue;
        }

        const type: JsonSchemaType | undefined = Array.isArray(s.type) ? s.type[0] : s?.type;
        if (!type) {
            continue;
        }

        if (!["string", "number", "integer", "boolean"].includes(type)) {
            throw new ErrorFormatted("Unsupported JSON Schema type {{ type }} in mission configuration", { type });
        }

        fields.push({
            name,
            ...s,
            type,
            isRequired: jsonSchema.required?.includes(name) || false,
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
