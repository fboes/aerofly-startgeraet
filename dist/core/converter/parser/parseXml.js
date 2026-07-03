export function parseXmlNode(xml, tag, defaultValue = "") {
    const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "ms"));
    return match ? unXml(match[1]) : defaultValue;
}
export function parseXmlNodes(xml, tag, defaultValue = []) {
    const nodes = xml.match(new RegExp(`<${tag}.*?</${tag}>`, "gms"));
    return nodes ? nodes : defaultValue;
}
export function parseXmlAttribute(xml, attribute, defaultValue = "") {
    const regex = new RegExp(` ${attribute}="(.*?)"`, "ms");
    const match = xml.match(regex);
    return match ? unXml(match[1]) : defaultValue;
}
function unXml(text) {
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
