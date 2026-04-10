export type AeroflyAirportSet = {
    code: string;
    name: string;
    lat: number;
    lon: number;
};
/**
 * Find detail data for Aerofly FS airports.
 * Interface to `@fboes/aerofly-data` JSON data.
 */
export declare class AeroflyAirportService {
    static getAllAirports(): AeroflyAirportSet[];
    static getAirportByIcaoCode(icaoCodeAirport: string): AeroflyAirportSet | undefined;
}
//# sourceMappingURL=AeroflyAirportService.d.ts.map
