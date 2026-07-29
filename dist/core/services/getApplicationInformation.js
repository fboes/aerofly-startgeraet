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
export function getGithubUsername() {
    return "fboes";
}
export function getGithubReponame() {
    return "aerofly-startgeraet";
}
export function getReleaseUrl() {
    return `https://github.com/${getGithubUsername()}/${getGithubReponame()}/releases/latest`;
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
export function getApplicationAuthorName() {
    return PackageJson.author.name;
}
export function getApplicationAuthorEmail() {
    return PackageJson.author.email;
}
export function getApplicationAuthorUrl() {
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
        github: {
            username: getGithubUsername(),
            reponame: getGithubReponame(),
            releaseUrl: getReleaseUrl(),
        },
    };
}
