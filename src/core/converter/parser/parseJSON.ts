import { ErrorDetail } from "../../util/ErrorFormatted.js";

export type JSONUnvalidated = Record<string, unknown>;

export function asJSONArray(json: unknown, propertyName = ""): JSONUnvalidated[] {
    if (!Array.isArray(json) || json === null) {
        throw new ErrorDetail("JSON property of type array expected", propertyName);
    }
    return json as JSONUnvalidated[];
}

export function asJSONObject(json: unknown, propertyName = ""): JSONUnvalidated {
    if (typeof json !== "object" || json === null) {
        throw new ErrorDetail("JSON property of type object expected", propertyName);
    }
    return json as JSONUnvalidated;
}

export function asJSONNumber(json: unknown, propertyName = ""): number {
    if (isNaN(json as number)) {
        throw new ErrorDetail("JSON property of type number expected", propertyName);
    }
    return Number(json);
}

export function asJSONString(json: unknown, propertyName = ""): string {
    if (typeof json !== "string" || json === null) {
        throw new ErrorDetail("JSON property of type string expected", propertyName);
    }
    return String(json);
}
