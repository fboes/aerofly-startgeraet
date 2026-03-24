import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";
export declare class AeroflyAircraftService {
    static getAllAircraftLiveries(): AeroflyAircraft[];
    static getAircraft(aeroflyCodeAircraft: string): AeroflyAircraft | undefined;
    static getAircraftByIcaoCode(icaoCodeAircraft: string): AeroflyAircraft | undefined;
    static getLiveryForAircraft(aircraft: AeroflyAircraft | undefined, aeroflyCodeLivery: string): AeroflyAircraftLivery | undefined;
    static getLiveryForAircraftByIcaoCode(aircraft: AeroflyAircraft | undefined, icaoCodeLivery: string): AeroflyAircraftLivery | undefined;
}
//# sourceMappingURL=AeroflyAircraftService.d.ts.map