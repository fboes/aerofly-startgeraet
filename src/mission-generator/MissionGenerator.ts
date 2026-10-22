import type { z } from "zod";
import type { MissionGenerator } from "./MissionGenerator.interface.js";
import type { MissionGeneratorManifest, MissionGeneratorManifestField } from "./MissionGenerator.type.js";
import { ErrorFormatted } from "../core/util/ErrorFormatted.js";
import { LandingPatternMissionGenerator } from "./generators/landing-pattern/LandingPatternMissionGenerator.js";
import type { AeroflyFlightService } from "../core/services/AeroflyFlightService.js";
import type { JsonSchemaObject, JsonSchemaType, JsonSchemaValue } from "./JsonSchema.type.js";
import { HoldingPatternMissionGenerator } from "./generators/holding-pattern/HoldingPatternMissionGenerator.js";
import { Config } from "../core/io/Config.js";
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

/**
 * @see restoreMissionGeneratorValues
 */
export function getMissionGeneratorManifest(
    generatorName: string,
    savedValues: Record<string, unknown> = {},
): MissionGeneratorManifest {
    const missionGenerator = getMissionGenerator(generatorName);
    const m = new missionGenerator();

    return {
        ...m.manifest(),
        configuration: getMissionGeneratorConfiguration(m.configuration(), savedValues),
    };
}

function getMissionGeneratorConfiguration(
    schema: z.ZodObject,
    savedValues: Record<string, unknown> = {},
): MissionGeneratorManifestField[] {
    const jsonSchema = schema.toJSONSchema() as JsonSchemaObject;
    if (!jsonSchema?.properties) {
        return [];
    }

    const verifiedValues = getMissionGeneratorConfigurationDefault(schema, savedValues);

    const fields: MissionGeneratorManifestField[] = [];
    for (const [jsonSchemaObjectName, jsonSchemaObject] of Object.entries(jsonSchema.properties)) {
        const type: JsonSchemaType | undefined = Array.isArray(jsonSchemaObject.type)
            ? jsonSchemaObject.type[0]
            : jsonSchemaObject?.type;
        if (!type) {
            continue;
        }

        if (!["string", "number", "integer", "boolean"].includes(type)) {
            throw new ErrorFormatted("Unsupported JSON Schema type {{ type }} in mission configuration", { type });
        }

        fields.push({
            name: jsonSchemaObjectName,
            ...jsonSchemaObject,
            type,
            isRequired: jsonSchema.required?.includes(jsonSchemaObjectName) || false,
            default: verifiedValues[jsonSchemaObjectName] ?? jsonSchemaObject.default,
        });
    }
    return fields;
}

function getMissionGeneratorConfigurationDefault(
    schema: z.ZodObject,
    values: Record<string, unknown> = {},
): Record<string, JsonSchemaValue> {
    const result: Record<string, JsonSchemaValue> = {};
    for (const [name, fieldSchema] of Object.entries(schema.shape)) {
        if (name in values && (fieldSchema as z.ZodType).safeParse(values[name]).success) {
            result[name] = values[name] as JsonSchemaValue;
        }
    }
    return result;
}

/**
 * @see storeMissionGeneratorValues
 */
export function executeMissionGenerator(
    service: AeroflyFlightService,
    generatorName: string,
    generatorPayload: Record<string, unknown>,
): Promise<boolean> {
    const missionGenerator = getMissionGenerator(generatorName);
    const m = new missionGenerator();

    const ZodSchema = m.configuration();
    const configuration = ZodSchema.parse(generatorPayload);

    return m.convert(configuration, service);
}

export function restoreMissionGeneratorValues(config: Config, generatorName: string): Record<string, unknown> {
    if (!MISSION_GENERATOR_REGISTRY[generatorName]) {
        throw new ErrorFormatted("Unknown mission generator used for calling settings: {{ generatorName }}", {
            generatorName,
        });
    }
    return config.getMissionGeneratorValues(generatorName);
}

export function storeMissionGeneratorValues(
    config: Config,
    generatorName: string,
    generatorValues: Record<string, unknown>,
): void {
    if (!MISSION_GENERATOR_REGISTRY[generatorName]) {
        throw new ErrorFormatted("Unknown mission generator used for storing settings: {{ generatorName }}", {
            generatorName,
        });
    }
    config.setMissionGeneratorValues(generatorName, generatorValues);
}
