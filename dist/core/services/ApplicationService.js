import PackageJson from "../../../package.json" with { type: "json" };
export function getPackageName() {
    return PackageJson.name;
}
export function getApplicationSlug() {
    return getPackageName().replace(/^.*?\//, "");
}
export function getApplicationName() {
    return "Aerofly Startgerät";
}
export function getApplicationVersion() {
    return PackageJson.version;
}
export function getApplicationNameVersion() {
    return getApplicationName() + " " + getApplicationVersion();
}
export function getApplicationDescription() {
    return PackageJson.description;
}
export function getApplicationJSON() {
    return {
        slug: getApplicationSlug(),
        name: getApplicationName(),
        version: getApplicationVersion(),
        description: getApplicationDescription(),
    };
}
