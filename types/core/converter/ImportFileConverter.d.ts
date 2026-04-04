import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare abstract class ImportFileConverter {
    abstract convert(content: string, flightplan: AeroflyFlight): void;
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
export declare abstract class ImportFileXMLConverter extends ImportFileConverter {
    protected getXmlNode(xml: string, tag: string): string;
    protected getXmlNodes(xml: string, tag: string): string[];
    protected getXmlAttribute(xml: string, attribute: string): string;
    protected unXml(text: string): string;
}
export type ImportFileJSONUnvalidated = Record<string, unknown>;
export declare abstract class ImportFileJSONConverter extends ImportFileConverter {
    protected getJSONArray(json: unknown): ImportFileJSONUnvalidated[];
    protected getJSONObject(json: unknown): ImportFileJSONUnvalidated;
    protected getJSONNumber(json: unknown): number;
    protected getJSONString(json: unknown): string;
}
//# sourceMappingURL=ImportFileConverter.d.ts.map