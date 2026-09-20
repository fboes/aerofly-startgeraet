export function numberFormat(value: number | undefined, fractionDigits: number = 0): string {
    if (value === undefined) {
        return "---";
    }
    return new Intl.NumberFormat(document.documentElement.lang, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
}
