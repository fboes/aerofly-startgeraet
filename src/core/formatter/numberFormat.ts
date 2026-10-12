import { APPLICATION_INFORMATION } from "../services/getApplicationInformation.js";

export function numberFormat(value: number | undefined, fractionDigits: number = 0): string {
    if (value === undefined) {
        return "---";
    }
    return new Intl.NumberFormat(APPLICATION_INFORMATION.locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
}
