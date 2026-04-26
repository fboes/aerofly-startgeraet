import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare abstract class StringToAeroflyFlightConverter {
    /**
     * In a given file there may be multiple flight plans present.
     * This method is supposed to return the name as well as indices of the found flight plans.
     * In most files there will be only a single flight plan included, so this will return a single string called "default".
     */
    getIndices(content: string): string[];
    abstract convert(content: string, flightplan: AeroflyFlight, index: number): void;
    /**
     * This function is a placeholder until the method to encode UIDs is discovered.
     *
     * @param lon - Longitude in degrees (-180 … +180)
     * @param lat - Latitude in degrees  (-90  … +90)
     * @returns UID as a BigInt (unsigned 64-bit integer)
     */
    protected geoToUid(lon: number, lat: number): bigint | undefined;
}
/**
 * This special ImportFileHandler adds basic XML parser functionality.
 */
export declare abstract class XMLToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    protected getXmlNode(xml: string, tag: string): string;
    protected getXmlNodes(xml: string, tag: string): string[];
    protected getXmlAttribute(xml: string, attribute: string): string;
    protected unXml(text: string): string;
}
export type JSONUnvalidated = Record<string, unknown>;
export declare abstract class JSONToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    protected getJSONArray(json: unknown): JSONUnvalidated[];
    protected getJSONObject(json: unknown): JSONUnvalidated;
    protected getJSONNumber(json: unknown): number;
    protected getJSONString(json: unknown): string;
}
//# sourceMappingURL=StringToAeroflyFlightConverter.d.ts.map
