import { Vector } from "@fboes/geojson";
export class AviationWeatherApi {
    static async fetchMetar(ids, date = null) {
        return AviationWeatherApi.doRequest("/api/data/metar", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // taf,
            // hours,
            // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
            date: date ? date.toISOString().replace(/\.\d+(Z)/, "$1") : "",
        }));
    }
    /**
     * @param position center of search area
     * @param distance in meters, default 1000
     * @param date if given, only metars for this date will be returned, otherwise the latest metars
     * @see https://aviationweather.gov/data/api/#/Data/dataMetar
     * @returns {Promise<AviationWeatherApiMetar[]>}
     */
    static async fetchMetarByPosition(position, distance = 1000, date = null) {
        return AviationWeatherApi.doRequest("/api/data/metar", new URLSearchParams({
            // ids: ids.join(","),
            format: "json",
            // taf,
            // hours,
            bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
            date: date ? date.toISOString().replace(/\.\d+(Z)/, "$1") : "",
        }));
    }
    static async doRequest(route, query) {
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
    static buildBbox(position, distance = 1000) {
        const southEast = position.getPointBy(new Vector(distance, 225));
        const northWest = position.getPointBy(new Vector(distance, 45));
        return [southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude];
    }
}
export class AviationWeatherNormalizedMetar {
    /**
     *
     * @param {AviationWeatherApiMetar} apiData
     */
    constructor({ icaoId, reportTime, temp, dewp, wdir, wspd, wgst, visib, altim, lat, lon, elev, clouds, }) {
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
    constructor({ cover, base }) {
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
