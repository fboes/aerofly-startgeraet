import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare abstract class StringToAeroflyFlightConverter {
    /**
     * In a given file there may be multiple flight plans present.
     * This method is supposed to return the name as well as indices of the found flight plans.
     * In most files there will be only a single flight plan included, so this will return a single string called "default".
     */
    getIndices(content: string): string[];
    abstract convert(content: string, flightplan: AeroflyFlight, index: number): void;
}
//# sourceMappingURL=StringToAeroflyFlightConverter.d.ts.map