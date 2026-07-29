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

export function getReleaseUrl(): string {
    return `https://github.com/${getGithubUsername()}/${getGithubReponame()}/releases/latest`;
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

export type ApplicationJSON = {
    slug: string;
    name: string;
    version: string;
    description: string;
    author: {
        name: string;
        email: string;
        url: string;
    };
    github: {
        username: string;
        reponame: string;
        releaseUrl: string;
    };
};

export function getApplicationJSON(): ApplicationJSON {
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
