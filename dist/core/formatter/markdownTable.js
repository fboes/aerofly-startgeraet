export function markdownTable(rows) {
    if (rows.length < 3) {
        throw new Error("Not enough rows");
    }
    const lengths = [];
    rows.map((row) => {
        row.map((cell, colIndex) => {
            lengths[colIndex] = Math.max(cell.length, lengths[colIndex] ?? 3);
        });
    });
    const alignmentRow = rows[1];
    if (!alignmentRow) {
        throw new Error("No alignment row found");
    }
    return rows
        .map((row, rowIndex) => {
        const cells = row.map((cell, colIndex) => {
            if (rowIndex == 1) {
                return cell.replace(/^(\S).+(\S)$/, `$1${"".padEnd((lengths[colIndex] ?? 3) - 2, "-")}$2`);
            }
            // Center align
            if (alignmentRow[colIndex]?.startsWith(":") && alignmentRow[colIndex]?.endsWith(":")) {
                const padding = ((lengths[colIndex] ?? 2) - cell.length) / 2;
                if (padding > 0) {
                    return " ".repeat(Math.floor(padding)) + cell + " ".repeat(Math.ceil(padding));
                }
            }
            // Left / right align
            return alignmentRow[colIndex]?.endsWith(":")
                ? cell.padStart(lengths[colIndex] ?? 3, " ")
                : cell.padEnd(lengths[colIndex] ?? 3, " ");
        });
        return `| ${cells.join(" | ")} |`;
    })
        .join("\n");
}
