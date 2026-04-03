export declare class SunPosition {
    /**
     * Simplified elevation/ azimuth calculation
     */
    static getSunPosition(
        utcHours: number,
        dayOfYear: number,
        latitude: number,
        longitude: number,
    ): {
        elevation: number;
        azimuth: number;
    };
    static dayOfYear(date: Date): number;
}
//# sourceMappingURL=SunPosition.d.ts.map
