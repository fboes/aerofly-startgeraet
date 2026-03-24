import AeroflyAircraftLiveries from "@fboes/aerofly-data/data/aircraft-liveries.json" with { type: "json" };
import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";

export class AeroflyAircraftService {
  static getAllAircraftLiveries(): AeroflyAircraft[] {
    return AeroflyAircraftLiveries;
  }

  static getAircraft(aeroflyCodeAircraft: string): AeroflyAircraft | undefined {
    return AeroflyAircraftLiveries.find((aircraft) => aircraft.aeroflyCode === aeroflyCodeAircraft);
  }

  static getAircraftByIcaoCode(icaoCodeAircraft: string): AeroflyAircraft | undefined {
    return AeroflyAircraftLiveries.find(
      (aircraft) => aircraft.icaoCode.toLowerCase() === icaoCodeAircraft.toLowerCase(),
    );
  }

  static getLiveryForAircraft(
    aircraft: AeroflyAircraft | undefined,
    aeroflyCodeLivery: string,
  ): AeroflyAircraftLivery | undefined {
    return aircraft?.liveries.find((livery) => livery.aeroflyCode === aeroflyCodeLivery);
  }

  static getLiveryForAircraftByIcaoCode(
    aircraft: AeroflyAircraft | undefined,
    icaoCodeLivery: string,
  ): AeroflyAircraftLivery | undefined {
    return aircraft?.liveries.find((livery) => livery.icaoCode?.toLowerCase() === icaoCodeLivery.toLowerCase());
  }
}
