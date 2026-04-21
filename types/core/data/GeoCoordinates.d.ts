type LonLatMinute = {
    degree: number;
    minutes: number;
    minutesDecimal: number;
    seconds: number;
    secondsDecimal: number;
};
export declare class GeoCoordinates {
    lon: number;
    lat: number;
    constructor(lon: number, lat: number);
    get lonRad(): number;
    get latRad(): number;
    get lonMinute(): LonLatMinute;
    get latMinute(): LonLatMinute;
    /**
     * Returns E or W
     */
    get lonHemisphere(): "E" | "W";
    /**
     * Returns N or S
     */
    get latHemisphere(): "N" | "S";
    protected convertMinute(lonOrLat: number): LonLatMinute;
    toString(fractionDigits?: number): string;
}
export {};
//# sourceMappingURL=GeoCoordinates.d.ts.map
