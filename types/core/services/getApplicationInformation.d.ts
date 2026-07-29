export declare function getPackageName(): string;
export declare function getApplicationSlug(): string;
export declare function getApplicationName(): string;
export declare function getGithubUsername(): string;
export declare function getGithubReponame(): string;
export declare function getReleaseUrl(): string;
export declare function getApplicationVersion(): string;
export declare function getApplicationNameVersion(): string;
export declare function getApplicationDescription(): string;
export declare function getApplicationAuthorName(): string;
export declare function getApplicationAuthorEmail(): string;
export declare function getApplicationAuthorUrl(): string;
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
export declare function getApplicationJSON(): ApplicationJSON;
//# sourceMappingURL=getApplicationInformation.d.ts.map