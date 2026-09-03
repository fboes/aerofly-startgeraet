export function parseXmlNode(xml: string, tag: string, defaultValue = ""): string {
    const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "ms"))?.[1];
    return match ? unXml(match) : defaultValue;
}

export function parseXmlNodes(xml: string, tag: string, defaultValue: string[] = []): string[] {
    const nodes = xml.match(new RegExp(`<${tag}.*?</${tag}>`, "gms"));
    return nodes ? nodes : defaultValue;
}

export function parseXmlAttribute(xml: string, attribute: string, defaultValue = ""): string {
    const regex = new RegExp(` ${attribute}="(.*?)"`, "ms");
    const match = xml.match(regex)?.[1];
    return match ? unXml(match) : defaultValue;
}

function unXml(text: string): string {
    const cdataMatch = text.match(/^<!\[CDATA\[(.+?)\]\]>$/)?.[1];
    return cdataMatch
        ? cdataMatch
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
