import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";

export class AeroflyFlightFormatter {
  static getAircraft(
    currentAircraft: AeroflyAircraft | undefined,
    currentLivery: AeroflyAircraftLivery | undefined,
  ): string {
    if (!currentAircraft) {
      return "No aircraft selected";
    }
    return `${currentAircraft.nameFull} - ${currentLivery?.name ?? "Default Livery"}`;
  }

  static getFuelAndPayload(aeroflyFlight: AeroflyFlight): string {
    return aeroflyFlight.fuelLoadSetting.fuelMass
      ? `${this.numberToString(aeroflyFlight.fuelLoadSetting.fuelMass)} / ${this.numberToString(aeroflyFlight.fuelLoadSetting.payloadMass)} kg`
      : "Unset";
  }

  static numberToString(num: number): string {
    return new Intl.NumberFormat().format(Math.round(num));
  }

  static dateToString(date: Date): string {
    return date.toISOString().substring(0, 16).replace("T", " ");
  }
}
