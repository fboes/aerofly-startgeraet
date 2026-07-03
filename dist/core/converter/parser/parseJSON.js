export function getJSONArray(json) {
    if (!Array.isArray(json) || json === null) {
        throw new Error("Element must be array");
    }
    return json;
}
export function getJSONObject(json) {
    if (typeof json !== "object" || json === null) {
        throw new Error("Element must be object");
    }
    return json;
}
export function getJSONNumber(json) {
    if (isNaN(json)) {
        throw new Error("Element must be number");
    }
    return Number(json);
}
export function getJSONString(json) {
    if (typeof json !== "string" || json === null) {
        throw new Error("Element must be string");
    }
    return String(json);
}
