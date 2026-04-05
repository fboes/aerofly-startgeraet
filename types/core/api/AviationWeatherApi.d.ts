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
    static doRequest<T>(route: string, query: URLSearchParams): Promise<T>;
    /**
     *
     * @param {Point} position
     * @param {number} [distance] in meters
     * @returns {[number,number,number,number]} southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude
     */
    static buildBbox(position: Point, distance?: number): [number, number, number, number];
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
//# sourceMappingURL=AviationWeatherApi.d.ts.map
