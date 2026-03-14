import { Vector, Point } from "@fboes/geojson";

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

  static async doRequest<T>(route: string, query: URLSearchParams): Promise<T> {
    const url = new URL(route + "?" + query, "https://aviationweather.gov");
    //console.log(url);
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    return await response.json();
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
}

export class AviationWeatherNormalizedMetar {
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
  }: AviationWeatherApiMetar) {
    this.icaoId = icaoId;
    this.reportTime = new Date(reportTime);
    this.temp = temp;
    this.dewp = dewp;
    this.wdir = wdir !== "VRB" ? wdir : null;
    this.wspd = wspd;

    /**
     * @type {number?} in kts
     */
    this.wgst = wgst;

    /**
     * @type {number} in SM, 10 on any distance being open-ended
     */
    this.visib = typeof visib === "string" ? 10 : visib;

    /**
     * @type {number} in hPa
     */
    this.altim = altim;
    this.lat = lat;
    this.lon = lon;
    this.elev = elev;

    /**
     * @type {AviationWeatherNormalizedCloud[]}
     */
    this.clouds = clouds.map((c) => {
      return new AviationWeatherNormalizedCloud(c);
    });
  }
}

export class AviationWeatherNormalizedCloud {
  cover: "CLR" | "FEW" | "SCT" | "BKN" | "OVC";

  /**
   *  0..8
   */
  coverOctas: number;

  /**
   *  in feet AGL
   */
  base: number | null;

  constructor({ cover, base }: AviationWeatherApiCloud) {
    this.cover = cover === "CAVOK" || cover === "SKC" ? "CLR" : cover;

    const coverOctas = {
      CLR: 0,
      FEW: 1,
      SCT: 2,
      BKN: 4,
      OVC: 8,
    };

    this.coverOctas = coverOctas[this.cover] ?? 0;
    this.base = base;
  }
}
