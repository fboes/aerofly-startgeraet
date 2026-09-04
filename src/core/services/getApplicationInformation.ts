import PackageJson from "../../../package.json" with { type: "json" };

export type ApplicationInformation = {
    slug: string;
    name: string;
    nameVersion: string;
    version: string;
    description: string;
    /**
     * BCP 47 locale code, e.g. "es-ES"
     */
    locale: string;
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
    isDev: boolean;
};

const [, username, reponame] = PackageJson.repository.url.match(/^https:\/\/github.com\/(.+?)\/(.+?)\.git$/) || [];
if (!username || !reponame) {
    throw new Error("Mission Github repository URL from package.json");
}

const isDev = process.argv.includes("--dev");
const version = PackageJson.version + (isDev ? "-dev" : "");

export const APPLICATION_INFORMATION: ApplicationInformation = {
    name: PackageJson.displayName,
    nameVersion: `${PackageJson.name} ${version}`,
    slug: reponame,
    version,
    description: PackageJson.description,
    locale: "en-US",
    author: {
        name: PackageJson.author.name,
        email: PackageJson.author.email,
        url: PackageJson.author.url,
    },
    github: {
        username,
        reponame,
        releaseUrl: PackageJson.releases,
    },
    isDev,
};
