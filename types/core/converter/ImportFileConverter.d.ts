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
}
//# sourceMappingURL=ImportFileConverter.d.ts.map
