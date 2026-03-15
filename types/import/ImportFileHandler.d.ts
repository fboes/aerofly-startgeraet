import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export interface ImportFileHandler {
    convert(content: string, flightplan: AeroflyFlight): void;
}
/**
 * This special ImportFileHandler adds basic XML parser functionality.
 */
export declare abstract class ImportFileXMLHandler implements ImportFileHandler {
    abstract convert(content: string, flightplan: AeroflyFlight): void;
    protected getXmlNode(xml: string, tag: string): string;
    protected getXmlNodes(xml: string, tag: string): string[];
    protected getXmlAttribute(xml: string, attribute: string): string;
    protected unXml(text: string): string;
}
//# sourceMappingURL=ImportFileHandler.d.ts.map