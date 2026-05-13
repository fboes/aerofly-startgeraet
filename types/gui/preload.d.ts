export type Process = {
    platform: NodeJS.Platform;
};
export type ApplicationService = {
    getApplicationName: () => Promise<string>;
    getApplicationVersion: () => Promise<string>;
};
//# sourceMappingURL=preload.d.ts.map
