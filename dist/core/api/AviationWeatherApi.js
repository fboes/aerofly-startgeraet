import { Vector, Point } from "@fboes/geojson";
export class AviationWeatherApi {
    static async fetchMetar(ids, date = null) {
        return AviationWeatherApi.doRequest("/api/data/metar", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // taf,
            // hours,
            // bbox: AviationWeatherApi.buildBbox(longitude, latitude, distance).join(","),
            date: date ? date.toISOString().replace(/\.\d+(Z)/, "$1") : "",
        }));
    }
    /**
     * @param {number} longitude center of search area
     * @param {number} latitude center of search area
     * @param distance in meters, default 1000
     * @param date if given, only metars for this date will be returned, otherwise the latest metars
     * @see https://aviationweather.gov/data/api/#/Data/dataMetar
     * @returns {Promise<AviationWeatherApiMetar[]>}
     */
    static async fetchMetarByPosition(longitude, latitude, distance = 1000, date = null) {
        return AviationWeatherApi.doRequest("/api/data/metar", new URLSearchParams({
            // ids: ids.join(","),
            format: "json",
            // taf,
            // hours,
            bbox: AviationWeatherApi.buildBbox(longitude, latitude, distance).join(","),
            date: date ? date.toISOString().replace(/\.\d+(Z)/, "$1") : "",
        }));
    }
    static async fetchAirports(ids) {
        return AviationWeatherApi.doRequest("/api/data/airport", new URLSearchParams({
            ids: ids.join(","),
            // bbox: AviationWeatherApi.buildBbox(longitude, latitude, distance).join(","),
            format: "json",
        })).then((data) => data.map((airport) => AviationWeatherApi.normalizeAirport(airport)));
    }
    static async fetchNavaids(ids) {
        return AviationWeatherApi.doRequest("/api/data/navaid", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // bbox: AviationWeatherApi.buildBbox(longitude, latitude, distance).join(","),
        })).then((data) => data.map((navaid) => AviationWeatherApi.normalizeNavAid(navaid)));
    }
    static async fetchFix(ids) {
        return AviationWeatherApi.doRequest("/api/data/fix", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // bbox: AviationWeatherApi.buildBbox(longitude, latitude, distance).join(","),
        }));
    }
    /**
     * @param {number} longitude center of search area
     * @param {number} latitude center of search area
     * @param distance in meters, default 1000
     * @see https://aviationweather.gov/data/api/#/Data/dataNavaid
     * @returns {Promise<AviationWeatherApiNavaid[]>}
     */
    static async fetchNavaidsByPosition(longitude, latitude, distance = 1000) {
        return AviationWeatherApi.doRequest("/api/data/navaid", new URLSearchParams({
            // ids: ids.join(","),
            format: "json",
            bbox: AviationWeatherApi.buildBbox(longitude, latitude, distance).join(","),
        })).then((data) => data.map((navaid) => AviationWeatherApi.normalizeNavAid(navaid)));
    }
    static async fetchFixByPosition(longitude, latitude, distance = 1000) {
        return AviationWeatherApi.doRequest("/api/data/fix", new URLSearchParams({
            // ids: ids.join(","),
            format: "json",
            bbox: AviationWeatherApi.buildBbox(longitude, latitude, distance).join(","),
        }));
    }
    static normalizeNavAid(navaid) {
        return {
            ...navaid,
            lat: Number(navaid.lat),
            lon: Number(navaid.lon),
            elev: Number(navaid.elev),
            freq: Number(navaid.freq),
            freq_unit: navaid.type === "NDB" ? "kHz" : "MHz",
            mag_dec: magDecConverter(navaid.mag_dec),
        };
    }
    static async doRequest(route, query) {
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
        return (await response.json());
    }
    /**
     *
     * @param {number} longitude center of search area
     * @param {number} latitude center of search area
     * @param {number} [distance] in meters
     * @returns {[number,number,number,number]} southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude
     */
    static buildBbox(longitude, latitude, distance = 1000) {
        const position = new Point(longitude, latitude);
        const southEast = position.getPointBy(new Vector(distance * 1.41, 225));
        const northWest = position.getPointBy(new Vector(distance * 1.41, 45));
        return [southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude];
    }
    static normalizeAirport(airport) {
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
            services: airport.services === "S",
            tower: airport.tower === "T",
            beacon: airport.beacon === "B",
            passengers: Number(airport.passengers),
            runways: airport.runways.map((r) => {
                const idSplit = r.id.split("/");
                const dimensionSplit = r.dimension.split("x");
                return {
                    ...r,
                    id: [idSplit[0] ?? "", idSplit[1] ?? ""],
                    dimension: [Number(dimensionSplit[0] ?? "0"), Number(dimensionSplit[1] ?? "0")],
                    alignment: r.alignment !== "-" ? Number(r.alignment) : null,
                };
            }),
            freqs: typeof airport.freqs !== "string"
                ? airport.freqs
                : airport.freqs.split(";").map((f) => {
                    const parts = f.split(",");
                    return {
                        type: parts[0],
                        freq: parts[1] ? Number(parts[1]) : undefined,
                    };
                }),
        };
    }
    static normalizeWeather(weather) {
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
export const magDecConverter = (magdec) => {
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
