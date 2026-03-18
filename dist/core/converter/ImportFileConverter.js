/**
 * This special ImportFileHandler adds basic XML parser functionality.
 */
export class ImportFileXMLConverter {
    getXmlNode(xml, tag) {
        const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "ms"));
        return match ? this.unXml(match[1]) : "";
    }
    getXmlNodes(xml, tag) {
        const nodes = xml.match(new RegExp(`<${tag}.*?</${tag}>`, "gms"));
        return nodes ? nodes : [];
    }
    getXmlAttribute(xml, attribute) {
        const regex = new RegExp(` ${attribute}="(.*?)"`, "ms");
        const match = xml.match(regex);
        return match ? this.unXml(match[1]) : "";
    }
    unXml(text) {
        const cdataMatch = text.match(/^<!\[CDATA\[(.+?)\]\]>$/);
        return cdataMatch
            ? cdataMatch[1]
            : text.replace(/&([a-z]+);/g, (m, inner) => {
                switch (inner) {
                    case "lt":
                        return "<";
                    case "gt":
                        return ">";
                    case "amp":
                        return "&";
                    case "quot":
                        return '"';
                    case "apos":
                        return "'";
                    default:
                        return m;
                }
            });
    }
}
