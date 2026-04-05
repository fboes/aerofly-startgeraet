export class ImportFileConverter {
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
/**
 * This special ImportFileHandler adds basic XML parser functionality.
 */
export class ImportFileXMLConverter extends ImportFileConverter {
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
export class ImportFileJSONConverter extends ImportFileConverter {
    getJSONArray(json) {
        if (!Array.isArray(json) || json === null) {
            throw new Error("Element must be array");
        }
        return json;
    }
    getJSONObject(json) {
        if (typeof json !== "object" || json === null) {
            throw new Error("Element must be object");
        }
        return json;
    }
    getJSONNumber(json) {
        if (isNaN(json)) {
            throw new Error("Element must be number");
        }
        return Number(json);
    }
    getJSONString(json) {
        if (typeof json !== "string" || json === null) {
            throw new Error("Element must be string");
        }
        return String(json);
    }
}
