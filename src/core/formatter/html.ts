/**
 * Creating safe HTML in Node.js / Browser alike.
 */

type HtmlFormatter = (text: string) => string;

type HtmlOption = {
    value: string;
    label: string;
};

/**
 * @returns an HTML string containg a list of e.g. `<td>`.
 */
export function htmlTableCells(cells: string[], tag = "td", formatter: HtmlFormatter = html) {
    const [openingTag, closingTag] = [`<${tag}>`, `</${tag}>`];

    return openingTag + cells.map((c) => formatter(c)).join(closingTag + "\n" + openingTag) + closingTag;
}

/**
 * @returns an HTML string containg a list of `<tr>` which in turn contain a list of `<td>`
 */
export function htmlTableRows(rows: string[][], tag: "td" | "th" = "td", formatter: HtmlFormatter = html) {
    return htmlTableCells(
        rows.map((r) => htmlTableCells(r, tag, formatter)),
        "tr",
        htmlRaw,
    );
}

/**
 * @returns an HTML string containg a list of `<option>`
 */
export function htmlOptions(options: HtmlOption[], tag = "option", formatter: HtmlFormatter = html) {
    return options.map((c) => `<${tag} value="${formatter(c.value)}">${formatter(c.label)}</${tag}>`).join("\n");
}

/**
 * Simple HTML quoting, converting plain text to safe HTML
 */
export function html(text: string) {
    return text.replace(/[<>"&']/g, (m) => {
        switch (m) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case '"':
                return "&quot;";
            case "'":
                return "&apos;";
            default:
                return m;
        }
    });
}

/**
 * Does not quote anything at all.
 */
export function htmlRaw(text: string) {
    return text;
}
