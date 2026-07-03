export class StringToAeroflyFlightConverter {
    // static readonly fileExtension: string;
    /**
     * In a given file there may be multiple flight plans present.
     * This method is supposed to return the name as well as indices of the found flight plans.
     * In most files there will be only a single flight plan included, so this will return a single string called "default".
     */
    getIndices(content) {
        if (content === "") {
            throw new Error("No content for importing found");
        }
        return ["default"];
    }
    /**
     * This function is a placeholder until the method to encode UIDs is discovered.
     *
     * @param lon - Longitude in degrees (-180 … +180)
     * @param lat - Latitude in degrees  (-90  … +90)
     * @returns UID as a BigInt (unsigned 64-bit integer)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    geoToUid(lon, lat) {
        return undefined;
    }
}
