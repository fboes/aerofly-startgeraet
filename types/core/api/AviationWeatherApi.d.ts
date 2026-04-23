/**
 * @see https://aviationweather.gov/data/api/#/Data/dataMetar
 */
export type AviationWeatherApiCloud = {
    cover: "CAVOK" | "CLR" | "SKC" | "FEW" | "SCT" | "BKN" | "OVC";
    base: number | null;
};
export type AviationWeatherNormalizedCloud = {
    cover: "CLR" | "FEW" | "SCT" | "BKN" | "OVC";
    /**
     *  0..8
     */
    coverOctas: number;
    /**
     *  in feet AGL
     */
    base: number | null;
};
/**
 * @see https://aviationweather.gov/data/api/#/Data/dataMetar
 */
export type AviationWeatherApiMetar = {
    icaoId: string;
    reportTime: string;
    temp: number;
    dewp: number;
    wdir: "VRB" | number;
    wspd: number;
    wgst: number | null;
    visib: string | number;
    altim: number;
    lat: number;
    lon: number;
    /**
     * meters MSL
     */
    elev: number;
    clouds: AviationWeatherApiCloud[];
};
export type AviationWeatherNormalizedMetar = {
    icaoId: string;
    reportTime: Date;
    /**
     * in °C
     */
    temp: number;
    /**
     * in °C
     */
    dewp: number;
    /**
     * in °, null on VRB
     */
    wdir: number | null;
    /**
     * in kts
     */
    wspd: number;
    wgst: number | null;
    /**
     * in SM, 10 on any distance being open-ended
     */
    visib: number;
    altim: number;
    lat: number;
    lon: number;
    /**
     * meters MSL
     */
    elev: number;
    clouds: AviationWeatherNormalizedCloud[];
};
type AviationWeatherApiRunwaySurface = "A" | "C" | "G" | "W" | "T" | "H";
/**
 * @see https://aviationweather.gov/data/api/#/Data/dataAirport
 */
export type AviationWeatherApiRunway = {
    id: string;
    dimension: string;
    surface: AviationWeatherApiRunwaySurface;
    alignment: string;
};
type AviationWeatherNormalizedRunway = {
    id: [string, string];
    /**
     * length, width in ft
     */
    dimension: [number, number];
    surface: AviationWeatherApiRunwaySurface;
    alignment: number | null;
};
/**
 * @see https://aviationweather.gov/data/api/#/Data/dataAirport
 */
export type AviationWeatherApiFrequency = {
    type: string;
    freq?: number;
};
/**
 * @see https://aviationweather.gov/data/api/#/Data/dataAirport
 */
export type AviationWeatherApiAirport = {
    icaoId: string;
    name: string;
    type: "ARP" | "HEL";
    lat: number;
    lon: number;
    /**
     * meters MSL
     */
    elev: number;
    magdec: string;
    rwyNum: string;
    tower: "T" | "-" | null;
    beacon: "B" | "-" | null;
    runways: AviationWeatherApiRunway[];
    freqs: AviationWeatherApiFrequency[] | string;
};
export type AviationWeatherNormalizedAirport = {
    icaoId: string;
    name: string;
    type: "ARP" | "HEL";
    lat: number;
    lon: number;
    /**
     * meters MSL
     */
    elev: number;
    magdec: number;
    rwyNum: string;
    tower: boolean;
    beacon: boolean;
    runways: AviationWeatherNormalizedRunway[];
    freqs: AviationWeatherApiFrequency[];
};
export type AviationWeatherApiNavaidType = "VORTAC" | "VOR/DME" | "TACAN" | "NDB" | "VOR";
/**
 * @see https://aviationweather.gov/data/api/#/Data/dataNavaid
 */
export type AviationWeatherApiNavaidRaw = {
    id: string;
    type: AviationWeatherApiNavaidType;
    name: string;
    lat: number | string;
    lon: number | string;
    elev: number | string;
    freq: number | string;
    mag_dec: string;
};
export type AviationWeatherApiNavaid = {
    id: string;
    type: AviationWeatherApiNavaidType;
    name: string;
    lat: number;
    lon: number;
    /**
     * meters MSL
     */
    elev: number;
    /**
     * in kHz for NDB, MHz for VOR/TACAN
     * @see https://aviationweather.gov/data/api/#/Data/dataNavaid
     */
    freq: number;
    freq_unit: "kHz" | "MHz";
    /**
     * with "+" to the east and "-" to the west. Substracted from a true heading this will give the magnetic heading.
     */
    mag_dec: number;
};
export type AviationWeatherApiFix = {
    id: string;
    type: "I" | "L" | "H" | "S" | "D" | "-";
    lat: number;
    lon: number;
};
export declare class AviationWeatherApi {
    static fetchMetar(ids: string[], date?: Date | null): Promise<AviationWeatherApiMetar[]>;
    /**
     * @param {number} longitude center of search area
     * @param {number} latitude center of search area
     * @param distance in meters, default 1000
     * @param date if given, only metars for this date will be returned, otherwise the latest metars
     * @see https://aviationweather.gov/data/api/#/Data/dataMetar
     * @returns {Promise<AviationWeatherApiMetar[]>}
     */
    static fetchMetarByPosition(
        longitude: number,
        latitude: number,
        distance?: number,
        date?: Date | null,
    ): Promise<AviationWeatherApiMetar[]>;
    static fetchAirports(ids: string[]): Promise<AviationWeatherApiAirport[]>;
    static fetchNavaids(ids: string[]): Promise<AviationWeatherApiNavaid[]>;
    static fetchFix(ids: string[]): Promise<AviationWeatherApiFix[]>;
    /**
     * @param {number} longitude center of search area
     * @param {number} latitude center of search area
     * @param distance in meters, default 1000
     * @see https://aviationweather.gov/data/api/#/Data/dataNavaid
     * @returns {Promise<AviationWeatherApiNavaid[]>}
     */
    static fetchNavaidsByPosition(
        longitude: number,
        latitude: number,
        distance?: number,
    ): Promise<AviationWeatherApiNavaid[]>;
    private static normalizeNavAid;
    static doRequest<T>(route: string, query: URLSearchParams): Promise<T>;
    /**
     *
     * @param {number} longitude center of search area
     * @param {number} latitude center of search area
     * @param {number} [distance] in meters
     * @returns {[number,number,number,number]} southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude
     */
    static buildBbox(longitude: number, latitude: number, distance?: number): [number, number, number, number];
    static normalizeAirport(airport: AviationWeatherApiAirport): AviationWeatherNormalizedAirport;
    static normalizeWeather(weather: AviationWeatherApiMetar): AviationWeatherNormalizedMetar;
}
/**
 * @returns {number} with "+" to the east and "-" to the west. Substracted from a true heading this will give the magnetic heading.
 */
export declare const magDecConverter: (magdec: string) => number;
export {};
//# sourceMappingURL=AviationWeatherApi.d.ts.map
