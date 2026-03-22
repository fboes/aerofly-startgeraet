import { AeroflyFlight } from "@fboes/aerofly-custom-missions";

export interface ImportFileConverter {
  // static readonly fileExtension: string;

  convert(content: string, flightplan: AeroflyFlight): void;
}

/**
 * This special ImportFileHandler adds basic XML parser functionality.
 */
export abstract class ImportFileXMLConverter implements ImportFileConverter {
  abstract convert(content: string, flightplan: AeroflyFlight): void;

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

  /**
   * Encodes WGS84 coordinates into a 64-bit UID,
   * where the upper 32 bits hold latitude × 10⁷
   * and the lower 32 bits hold longitude × 10⁷.
   *
   * @param lon - Longitude in degrees (-180 … +180)
   * @param lat - Latitude in degrees  (-90  … +90)
   * @returns UID as a BigInt (unsigned 64-bit integer)
   */
  protected geoToUid(lon: number, lat: number): bigint {
    const SCALE = 1e7;
    const MASK = 0xffff_ffffn;

    const latFixed = BigInt(Math.round(lat * SCALE));
    const lonFixed = BigInt(Math.round(lon * SCALE));

    return ((latFixed & MASK) << 32n) | (lonFixed & MASK);
  }
}
