import PackageJson from "../../../package.json" with { type: "json" };
export const APPLICATION_INFORMATION = {
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
