import { AeroflyFlight } from "@fboes/aerofly-custom-missions";

export abstract class ImportFileConverter {
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

    abstract convert(content: string, flightplan: AeroflyFlight, index: number): void;

    /**
     * This function is a placeholder until the method to encode UIDs is discovered.
     *
     * @param lon - Longitude in degrees (-180 … +180)
     * @param lat - Latitude in degrees  (-90  … +90)
     * @returns UID as a BigInt (unsigned 64-bit integer)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected geoToUid(lon: number, lat: number): bigint | undefined {
        return undefined;
    }
}

/**
 * This special ImportFileHandler adds basic XML parser functionality.
 */
export abstract class ImportFileXMLConverter extends ImportFileConverter {
    protected getXmlNode(xml: string, tag: string): string {
        const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "ms"));
        return match ? this.unXml(match[1]) : "";
    }

    protected getXmlNodes(xml: string, tag: string): string[] {
        const nodes = xml.match(new RegExp(`<${tag}.*?</${tag}>`, "gms"));

        return nodes ? nodes : [];
    }

    protected getXmlAttribute(xml: string, attribute: string): string {
        const regex = new RegExp(` ${attribute}="(.*?)"`, "ms");
        const match = xml.match(regex);
        return match ? this.unXml(match[1]) : "";
    }

    protected unXml(text: string): string {
        const cdataMatch = text.match(/^<!\[CDATA\[(.+?)\]\]>$/);
        return cdataMatch
            ? cdataMatch[1]
            : text.replace(/&([a-z]+);/g, (m, inner: string) => {
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

export type ImportFileJSONUnvalidated = Record<string, unknown>;

export abstract class ImportFileJSONConverter extends ImportFileConverter {
    protected getJSONArray(json: unknown): ImportFileJSONUnvalidated[] {
        if (!Array.isArray(json) || json === null) {
            throw new Error("Element must be array");
        }
        return json as ImportFileJSONUnvalidated[];
    }

    protected getJSONObject(json: unknown): ImportFileJSONUnvalidated {
        if (typeof json !== "object" || json === null) {
            throw new Error("Element must be object");
        }
        return json as ImportFileJSONUnvalidated;
    }

    protected getJSONNumber(json: unknown): number {
        if (isNaN(json as number)) {
            throw new Error("Element must be number");
        }
        return Number(json);
    }

    protected getJSONString(json: unknown): string {
        if (typeof json !== "string" || json === null) {
            throw new Error("Element must be string");
        }
        return String(json);
    }
}
