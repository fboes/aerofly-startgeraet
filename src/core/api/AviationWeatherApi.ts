import { Vector, Point } from "@fboes/geojson";

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

export class AviationWeatherApi {
    static async fetchMetar(ids: string[], date: Date | null = null): Promise<AviationWeatherApiMetar[]> {
        return AviationWeatherApi.doRequest<AviationWeatherApiMetar[]>(
            "/api/data/metar",
            new URLSearchParams({
                ids: ids.join(","),
                format: "json",
                // taf,
                // hours,
                // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
                date: date ? date.toISOString().replace(/\.\d+(Z)/, "$1") : "",
            }),
        );
    }

    /**
     * @param position center of search area
     * @param distance in meters, default 1000
     * @param date if given, only metars for this date will be returned, otherwise the latest metars
     * @see https://aviationweather.gov/data/api/#/Data/dataMetar
     * @returns {Promise<AviationWeatherApiMetar[]>}
     */
    static async fetchMetarByPosition(
        position: Point,
        distance: number = 1000,
        date: Date | null = null,
    ): Promise<AviationWeatherApiMetar[]> {
        return AviationWeatherApi.doRequest<AviationWeatherApiMetar[]>(
            "/api/data/metar",
            new URLSearchParams({
                // ids: ids.join(","),
                format: "json",
                // taf,
                // hours,
                bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
                date: date ? date.toISOString().replace(/\.\d+(Z)/, "$1") : "",
            }),
        );
    }

    static async fetchAirports(ids: string[]): Promise<AviationWeatherApiAirport[]> {
        return AviationWeatherApi.doRequest(
            "/api/data/airport",
            new URLSearchParams({
                ids: ids.join(","),
                // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
                format: "json",
            }),
        );
    }

    static async fetchNavaids(ids: string[]): Promise<AviationWeatherApiNavaid[]> {
        return AviationWeatherApi.doRequest<AviationWeatherApiNavaidRaw[]>(
            "/api/data/navaid",
            new URLSearchParams({
                ids: ids.join(","),
                format: "json",
                // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
            }),
        ).then((data) => {
            return AviationWeatherApi.normalizeNavAid(data);
        });
    }

    static async fetchFix(ids: string[]): Promise<AviationWeatherApiFix[]> {
        return AviationWeatherApi.doRequest<AviationWeatherApiFix[]>(
            "/api/data/fix",
            new URLSearchParams({
                ids: ids.join(","),
                format: "json",
                // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
            }),
        );
    }

    /**
     * @param position center of search area
     * @param distance in meters, default 1000
     * @see https://aviationweather.gov/data/api/#/Data/dataNavaid
     * @returns {Promise<AviationWeatherApiNavaid[]>}
     */
    static async fetchNavaidsByPosition(position: Point, distance: number = 1000): Promise<AviationWeatherApiNavaid[]> {
        return AviationWeatherApi.doRequest<AviationWeatherApiNavaidRaw[]>(
            "/api/data/navaid",
            new URLSearchParams({
                // ids: ids.join(","),
                format: "json",
                bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
            }),
        ).then((data) => {
            return AviationWeatherApi.normalizeNavAid(data);
        });
    }

    private static normalizeNavAid(data: AviationWeatherApiNavaidRaw[]): AviationWeatherApiNavaid[] {
        return data.map((navaid: AviationWeatherApiNavaidRaw): AviationWeatherApiNavaid => {
            return {
                ...navaid,
                lat: Number(navaid.lat),
                lon: Number(navaid.lon),
                elev: Number(navaid.elev),
                freq: Number(navaid.freq),
                mag_dec: magDecConverter(navaid.mag_dec),
            };
        });
    }

    static async doRequest<T>(route: string, query: URLSearchParams): Promise<T> {
        const url = new URL(route + "?" + query.toString(), "https://aviationweather.gov");
        //console.log(url);
        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
            },
        });
        if (!response.body) {
            throw new Error("No results returned");
        }

        return (await response.json()) as T;
    }

    /**
     *
     * @param {Point} position
     * @param {number} [distance] in meters
     * @returns {[number,number,number,number]} southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude
     */
    static buildBbox(position: Point, distance: number = 1000): [number, number, number, number] {
        const southEast = position.getPointBy(new Vector(distance, 225));
        const northWest = position.getPointBy(new Vector(distance, 45));
        return [southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude];
    }

    static normalizeAirport(airport: AviationWeatherApiAirport): AviationWeatherNormalizedAirport {
        return {
            ...airport,
            name: airport.name
                .replace(/_/g, " ")
                .trim()
                .replace(/\bINTL\b/g, "INTERNATIONAL")
                .replace(/\bRGNL\b/g, "REGIONAL")
                .replace(/\bFLD\b/g, "FIELD")
                .replace(/(\/)/g, " $1 ")
                .toLowerCase()
                .replace(/(^|\s)[a-z]/g, (char) => {
                    return char.toUpperCase();
                }),
            magdec: magDecConverter(airport.magdec),
            tower: airport.tower === "T",
            beacon: airport.beacon === "B",
            runways: airport.runways.map((r) => {
                return new AviationWeatherNormalizedRunway(r);
            }),
            freqs:
                typeof airport.freqs !== "string"
                    ? airport.freqs
                    : airport.freqs.split(";").map((f: string): AviationWeatherApiFrequency => {
                          const parts = f.split(",");
                          return {
                              type: parts[0],
                              freq: parts[1] ? Number(parts[1]) : undefined,
                          };
                      }),
        };
    }

    static normalizeWeather(weather: AviationWeatherApiMetar): AviationWeatherNormalizedMetar {
        return {
            ...weather,
            reportTime: new Date(weather.reportTime),
            wdir: weather.wdir !== "VRB" ? weather.wdir : null,
            visib: typeof weather.visib === "string" ? 10 : weather.visib,
            clouds: weather.clouds.map((c) => {
                return {
                    ...c,
                    cover: c.cover === "CAVOK" || c.cover === "SKC" ? "CLR" : c.cover,
                    coverOctas: {
                        CLR: 0,
                        CAVOK: 0,
                        SKC: 0,
                        FEW: 1,
                        SCT: 2,
                        BKN: 4,
                        OVC: 8,
                    }[c.cover],
                };
            }),
        };
    }
}

/**
 * @returns {number} with "+" to the east and "-" to the west. Substracted from a true heading this will give the magnetic heading.
 */
export const magDecConverter = (magdec: string): number => {
    let magDec = 0;
    const magdecMatch = magdec.match(/^(\d+)(E|W)$/);
    if (magdecMatch) {
        magDec = Number(magdecMatch[1]);
        if (magdecMatch[2] === "W") {
            magDec *= -1;
        }
    }
    return magDec;
};

export class AviationWeatherNormalizedRunway {
    id: [string, string];

    /**
     * length, width in ft
     */
    dimension: [number, number];
    surface: string;
    alignment: number | null;

    constructor({ id, dimension, surface, alignment }: AviationWeatherApiRunway) {
        /**
         * @type {[string,string]} both directions
         */
        this.id = ["", ""];
        id.split("/").forEach((i, index) => {
            this.id[index] = i;
        });
        this.dimension = [0, 0];
        dimension
            .split("x")
            .map((x) => Number(x))
            .forEach((d, index) => {
                this.dimension[index] = d;
            });
        this.surface = surface;
        this.alignment = alignment !== "-" ? Number(alignment) : null;
    }
}
