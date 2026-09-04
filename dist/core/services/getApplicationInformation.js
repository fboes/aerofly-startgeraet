import PackageJson from "../../../package.json" with { type: "json" };
const [, username, reponame] = PackageJson.repository.url.match(/^https:\/\/github.com\/(.+?)\/(.+?)\.git$/) || [];
if (!username || !reponame) {
    throw new Error("Mission Github repository URL from package.json");
}
const isDev = process.argv.includes("--dev");
const version = PackageJson.version + (isDev ? "-dev" : "");
export const APPLICATION_INFORMATION = {
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
