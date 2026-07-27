type GithubReleaseApiPayload = {
    tag_name: string;
    name: string;
    html_url: string;
};

/**
 * Compare local version of app with latest release available at GitHub
 */
export class UpdateCheckService {
    constructor(
        public owner: string,
        public repo: string,
    ) {}

    async isUpdateAvailable(currentLocalVersion: string): Promise<GithubReleaseApiPayload | null> {
        if (!currentLocalVersion) {
            throw Error("No local version number supplied for update check");
        }
        const payload = await this.makeGithubReleaseRequest();
        if (currentLocalVersion.replace(/^v/, "") === payload.tag_name.replace(/^v/, "")) {
            return null;
        }

        return payload;
    }

    async makeGithubReleaseRequest(timeoutMs = 5000): Promise<GithubReleaseApiPayload> {
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

        const payload = (await response.json()) as GithubReleaseApiPayload;
        if (!payload.tag_name || !payload.name || !payload.html_url) {
            throw Error("No information available on latest release");
        }

        return payload;
    }
}
