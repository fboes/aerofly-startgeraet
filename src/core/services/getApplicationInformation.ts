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
};

export const APPLICATION_INFORMATION: ApplicationInformation = {
    name: "Aerofly Startgerät",
    nameVersion: `${PackageJson.name} ${PackageJson.version}`,
    slug: PackageJson.name.replace(/^.*?\//, ""),
    version: PackageJson.version,
    description: PackageJson.description,
    locale: "en-US",
    author: {
        name: PackageJson.author.name,
        email: PackageJson.author.email,
        url: PackageJson.author.url,
    },
    github: {
        username: "fboes",
        reponame: "aerofly-startgeraet",
        releaseUrl: `https://github.com/fboes/aerofly-startgeraet/releases/latest`,
    },
};
