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
