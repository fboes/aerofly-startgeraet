import PackageJson from "../../../package.json" with { type: "json" };

export function getPackageName(): string {
    return PackageJson.name;
}

export function getApplicationSlug(): string {
    return getPackageName().replace(/^.*?\//, "");
}

export function getApplicationName(): string {
    return "Aerofly Startgerät";
}

export function getApplicationVersion(): string {
    return PackageJson.version;
}

export function getApplicationNameVersion(): string {
    return getApplicationName() + " " + getApplicationVersion();
}

export function getApplicationDescription(): string {
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
