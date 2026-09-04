export function numberFormat(value) {
    if (value === undefined) {
        return "---";
    }
    return new Intl.NumberFormat(document.documentElement.lang, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}
