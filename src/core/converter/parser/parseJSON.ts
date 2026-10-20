export type JSONUnvalidated = Record<string, unknown>;

export function asJSONArray(json: unknown): JSONUnvalidated[] {
    if (!Array.isArray(json) || json === null) {
        throw new Error("Element must be array");
    }
    return json as JSONUnvalidated[];
}

export function asJSONObject(json: unknown): JSONUnvalidated {
    if (typeof json !== "object" || json === null) {
        throw new Error("Element must be object");
    }
    return json as JSONUnvalidated;
}

export function asJSONNumber(json: unknown): number {
    if (isNaN(json as number)) {
        throw new Error("Element must be number");
    }
    return Number(json);
}

export function asJSONString(json: unknown): string {
    if (typeof json !== "string" || json === null) {
        throw new Error("Element must be string");
    }
    return String(json);
}
