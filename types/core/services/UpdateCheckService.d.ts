type GithubReleaseApiPayload = {
    tag_name: string;
    name: string;
    html_url: string;
};
/**
 * Compare local version of app with latest release available at GitHub
 */
export declare class UpdateCheckService {
    owner: string;
    repo: string;
    constructor(owner: string, repo: string);
    isUpdateAvailable(currentLocalVersion: string): Promise<GithubReleaseApiPayload | null>;
    makeGithubReleaseRequest(timeoutMs?: number): Promise<GithubReleaseApiPayload>;
}
export {};
//# sourceMappingURL=UpdateCheckService.d.ts.map