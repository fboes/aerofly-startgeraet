import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";

export abstract class StringToAeroflyFlightConverter {
    // static readonly fileExtension: string;

    /**
     * In a given file there may be multiple flight plans present.
     * This method is supposed to return the name as well as indices of the found flight plans.
     * In most files there will be only a single flight plan included, so this will return a single string called "default".
     */
    getIndices(content: string): string[] {
        if (content === "") {
            throw new Error("No content for importing found");
        }
        return ["default"];
    }

    parseNumberOrError(content: string, reference: string = ""): number {
        const v = Number(content);
        if (isNaN(v)) {
            throw new Error(`Could not parse "${content}" as number` + (reference ? `, reference "${reference}"` : ""));
        }
        return v;
    }

    parseNumber(content: string, fallback: number): number {
        const v = Number(content);
        return isNaN(v) ? fallback : v;
    }

    abstract convert(content: string, flightplan: AeroflyFlight, index: number): void;
}
