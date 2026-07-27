/**
 * Compare local version of app with latest release available at GitHub
 */
export class UpdateCheckService {
    owner;
    repo;
    constructor(owner, repo) {
        this.owner = owner;
        this.repo = repo;
    }
    async isUpdateAvailable(currentLocalVersion) {
        if (!currentLocalVersion) {
            throw Error("No local version number supplied for update check");
        }
        const payload = await this.makeGithubReleaseRequest();
        if (currentLocalVersion.replace(/^v/, "") === payload.tag_name.replace(/^v/, "")) {
            return null;
        }
        return payload;
    }
    async makeGithubReleaseRequest(timeoutMs = 5000) {
        const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`, {
            headers: {
                Accept: "application/json",
                "User-Agent": `${this.owner}/${this.repo} App Update Check Service`,
            },
            signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.body) {
            throw new Error("No results returned");
        }
        const payload = (await response.json());
        if (!payload.tag_name || !payload.name || !payload.html_url) {
            throw Error("No information available on latest release");
        }
        return payload;
    }
}
