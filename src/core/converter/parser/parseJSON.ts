export type JSONUnvalidated = Record<string, unknown>;

export function asJSONArray(json: unknown): JSONUnvalidated[] {
    if (!Array.isArray(json) || json === null) {
        throw new Error("JSON property of type array expected");
    }
    return json as JSONUnvalidated[];
}

export function asJSONObject(json: unknown): JSONUnvalidated {
    if (typeof json !== "object" || json === null) {
        throw new Error("JSON property of type object expected");
    }
    return json as JSONUnvalidated;
}

export function asJSONNumber(json: unknown): number {
    if (isNaN(json as number)) {
        throw new Error("JSON property of type number expected");
    }
    return Number(json);
}

export function asJSONString(json: unknown): string {
    if (typeof json !== "string" || json === null) {
        throw new Error("JSON property of type string expected");
    }
    return String(json);
}
