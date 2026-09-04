export function numberFormat(value: number | undefined): string {
    if (value === undefined) {
        return "---";
    }
    return new Intl.NumberFormat(document.documentElement.lang, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}
