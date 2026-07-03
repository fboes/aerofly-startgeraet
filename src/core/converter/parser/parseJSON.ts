export type JSONUnvalidated = Record<string, unknown>;

export function getJSONArray(json: unknown): JSONUnvalidated[] {
    if (!Array.isArray(json) || json === null) {
        throw new Error("Element must be array");
    }
    return json as JSONUnvalidated[];
}

export function getJSONObject(json: unknown): JSONUnvalidated {
    if (typeof json !== "object" || json === null) {
        throw new Error("Element must be object");
    }
    return json as JSONUnvalidated;
}

export function getJSONNumber(json: unknown): number {
    if (isNaN(json as number)) {
        throw new Error("Element must be number");
    }
    return Number(json);
}

export function getJSONString(json: unknown): string {
    if (typeof json !== "string" || json === null) {
        throw new Error("Element must be string");
    }
    return String(json);
}
