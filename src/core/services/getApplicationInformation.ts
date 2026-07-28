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

export function getGithubUsername(): string {
    return "fboes";
}

export function getGithubReponame(): string {
    return "aerofly-startgeraet";
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

export function getApplicationAuthorName(): string {
    return PackageJson.author.name;
}

export function getApplicationAuthorEmail(): string {
    return PackageJson.author.email;
}

export function getApplicationAuthorUrl(): string {
    return PackageJson.author.url;
}

export function getApplicationJSON() {
    return {
        slug: getApplicationSlug(),
        name: getApplicationName(),
        version: getApplicationVersion(),
        description: getApplicationDescription(),
        author: {
            name: getApplicationAuthorName(),
            email: getApplicationAuthorEmail(),
            url: getApplicationAuthorUrl(),
        },
    };
}
