import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class AeroflyFlightHelper {
    /**
     *
     * @returns in meters
     */
    static getFlightplanDistance(aeroflyFlight: AeroflyFlight): number;
    /**
     * @returns nautical time zone offset based on the coordinates of the departure airport
     */
    static getDepartureTimeZone(aeroflyFlight: AeroflyFlight): number;
}
//# sourceMappingURL=AeroflyFlightHelper.d.ts.map