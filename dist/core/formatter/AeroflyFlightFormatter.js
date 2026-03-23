export class AeroflyFlightFormatter {
    static getAircraft(currentAircraft, currentLivery) {
        if (!currentAircraft) {
            return "No aircraft selected";
        }
        return `${currentAircraft.nameFull} - ${currentLivery?.name ?? "Default Livery"}`;
    }
    static getFuelAndPayload(aeroflyFlight) {
        return aeroflyFlight.fuelLoadSetting.fuelMass
            ? `${this.numberToString(aeroflyFlight.fuelLoadSetting.fuelMass)} / ${this.numberToString(aeroflyFlight.fuelLoadSetting.payloadMass)} kg`
            : "Unset";
    }
    static numberToString(num) {
        return new Intl.NumberFormat().format(Math.round(num));
    }
    static dateToString(date) {
        return date.toISOString().substring(0, 16).replace("T", " ");
    }
}
