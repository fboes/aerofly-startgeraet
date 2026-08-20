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
export declare const APPLICATION_INFORMATION: ApplicationInformation;
//# sourceMappingURL=getApplicationInformation.d.ts.map