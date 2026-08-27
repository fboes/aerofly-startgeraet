export class StringToAeroflyFlightConverter {
    // static readonly fileName: string;
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
    parseNumberOrError(content, reference = "") {
        const v = Number(content);
        if (isNaN(v)) {
            throw new Error(`Could not parse "${content}" as number` + (reference ? `, reference "${reference}"` : ""));
        }
        return v;
    }
    parseNumber(content, fallback) {
        const v = Number(content);
        return isNaN(v) ? fallback : v;
    }
}
