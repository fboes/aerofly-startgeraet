import { Point } from "@fboes/geojson";
/**
 * @see https://aviationweather.gov/data/api/#/Data/dataMetar
 */
export interface AviationWeatherApiCloud {
    cover: "CAVOK" | "CLR" | "SKC" | "FEW" | "SCT" | "BKN" | "OVC";
    base: number | null;
}
/**
 * @see https://aviationweather.gov/data/api/#/Data/dataMetar
 */
export interface AviationWeatherApiMetar {
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
}
type AviationWeatherApiRunwaySurface = "A" | "C" | "G" | "W" | "T" | "H";
/**
 * @see https://aviationweather.gov/data/api/#/Data/dataAirport
 */
export interface AviationWeatherApiRunway {
    id: string;
    dimension: string;
    surface: AviationWeatherApiRunwaySurface;
    alignment: string;
}
/**
 * @see https://aviationweather.gov/data/api/#/Data/dataAirport
 */
export interface AviationWeatherApiFrequency {
    type: string;
    freq?: number;
}
/**
 * @see https://aviationweather.gov/data/api/#/Data/dataAirport
 */
export interface AviationWeatherApiAirport {
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
}
export type AviationWeatherApiNavaidType = "VORTAC" | "VOR/DME" | "TACAN" | "NDB" | "VOR";
/**
 * @see https://aviationweather.gov/data/api/#/Data/dataNavaid
 */
export interface AviationWeatherApiNavaidRaw {
    id: string;
    type: AviationWeatherApiNavaidType;
    name: string;
    lat: number | string;
    lon: number | string;
    elev: number | string;
    freq: number | string;
    mag_dec: string;
}
export interface AviationWeatherApiNavaid {
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
    /**
     * with "+" to the east and "-" to the west. Substracted from a true heading this will give the magnetic heading.
     */
    mag_dec: number;
}
export interface AviationWeatherApiFix {
    id: string;
    type: "I" | "L" | "H" | "S" | "D" | "-" | string;
    lat: number;
    lon: number;
}
export declare class AviationWeatherApi {
    static fetchMetar(ids: string[], date?: Date | null): Promise<AviationWeatherApiMetar[]>;
    /**
     * @param position center of search area
     * @param distance in meters, default 1000
     * @param date if given, only metars for this date will be returned, otherwise the latest metars
     * @see https://aviationweather.gov/data/api/#/Data/dataMetar
     * @returns {Promise<AviationWeatherApiMetar[]>}
     */
    static fetchMetarByPosition(
        position: Point,
        distance?: number,
        date?: Date | null,
    ): Promise<AviationWeatherApiMetar[]>;
    static fetchAirports(ids: string[]): Promise<AviationWeatherApiAirport[]>;
    static fetchNavaids(ids: string[]): Promise<AviationWeatherApiNavaid[]>;
    static fetchFix(ids: string[]): Promise<AviationWeatherApiFix[]>;
    /**
     * @param position center of search area
     * @param distance in meters, default 1000
     * @see https://aviationweather.gov/data/api/#/Data/dataNavaid
     * @returns {Promise<AviationWeatherApiNavaid[]>}
     */
    static fetchNavaidsByPosition(position: Point, distance?: number): Promise<AviationWeatherApiNavaid[]>;
    private static normalizeNavAid;
    static doRequest<T>(route: string, query: URLSearchParams): Promise<T>;
    /**
     *
     * @param {Point} position
     * @param {number} [distance] in meters
     * @returns {[number,number,number,number]} southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude
     */
    static buildBbox(position: Point, distance?: number): [number, number, number, number];
}
/**
 * @returns {number} with "+" to the east and "-" to the west. Substracted from a true heading this will give the magnetic heading.
 */
export declare const magDecConverter: (magdec: string) => number;
export declare class AviationWeatherNormalizedAirport {
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
    rwyNum: number;
    tower: boolean;
    beacon: boolean;
    runways: AviationWeatherNormalizedRunway[];
    freqs: AviationWeatherApiFrequency[];
    /**
     * @param {AviationWeatherApiAirport} apiData
     */
    constructor({
        icaoId,
        name,
        type,
        lat,
        lon,
        elev,
        magdec,
        rwyNum,
        tower,
        beacon,
        runways,
        freqs,
    }: AviationWeatherApiAirport);
}
export declare class AviationWeatherNormalizedRunway {
    id: [string, string];
    /**
     * length, width in ft
     */
    dimension: [number, number];
    surface: string;
    alignment: number | null;
    constructor({ id, dimension, surface, alignment }: AviationWeatherApiRunway);
}
export declare class AviationWeatherNormalizedMetar {
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
    /**
     *
     * @param {AviationWeatherApiMetar} apiData
     */
    constructor({
        icaoId,
        reportTime,
        temp,
        dewp,
        wdir,
        wspd,
        wgst,
        visib,
        altim,
        lat,
        lon,
        elev,
        clouds,
    }: AviationWeatherApiMetar);
}
export declare class AviationWeatherNormalizedCloud {
    cover: "CLR" | "FEW" | "SCT" | "BKN" | "OVC";
    /**
     *  0..8
     */
    coverOctas: number;
    /**
     *  in feet AGL
     */
    base: number | null;
    constructor({ cover, base }: AviationWeatherApiCloud);
}
export {};
//# sourceMappingURL=AviationWeatherApi.d.ts.map
