import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export interface ImportFileConverter {
  convert(content: string, flightplan: AeroflyFlight): void;
}
/**
 * This special ImportFileHandler adds basic XML parser functionality.
 */
export declare abstract class ImportFileXMLConverter implements ImportFileConverter {
  abstract convert(content: string, flightplan: AeroflyFlight): void;
  protected getXmlNode(xml: string, tag: string): string;
  protected getXmlNodes(xml: string, tag: string): string[];
  protected getXmlAttribute(xml: string, attribute: string): string;
  protected unXml(text: string): string;
  /**
   * This function is a placeholder until the method to encode UIDs is discovered.
   *
   * @param lon - Longitude in degrees (-180 … +180)
   * @param lat - Latitude in degrees  (-90  … +90)
   * @returns UID as a BigInt (unsigned 64-bit integer)
   */
  protected geoToUid(lon: number, lat: number): bigint | undefined;
}
//# sourceMappingURL=ImportFileConverter.d.ts.map
