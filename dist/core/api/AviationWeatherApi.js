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
    static async fetchAirports(ids) {
        return AviationWeatherApi.doRequest("/api/data/airport", new URLSearchParams({
            ids: ids.join(","),
            // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
            format: "json",
        }));
    }
    static async fetchNavaids(ids) {
        return AviationWeatherApi.doRequest("/api/data/navaid", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
        })).then((data) => {
            return AviationWeatherApi.normalizeNavAid(data);
        });
    }
    static async fetchFix(ids) {
        return AviationWeatherApi.doRequest("/api/data/fix", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
        }));
    }
    /**
     * @param position center of search area
     * @param distance in meters, default 1000
     * @see https://aviationweather.gov/data/api/#/Data/dataNavaid
     * @returns {Promise<AviationWeatherApiNavaid[]>}
     */
    static async fetchNavaidsByPosition(position, distance = 1000) {
        return AviationWeatherApi.doRequest("/api/data/navaid", new URLSearchParams({
            // ids: ids.join(","),
            format: "json",
            bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
        })).then((data) => {
            return AviationWeatherApi.normalizeNavAid(data);
        });
    }
    static normalizeNavAid(data) {
        return data.map((navaid) => {
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
     * @param {Point} position
     * @param {number} [distance] in meters
     * @returns {[number,number,number,number]} southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude
     */
    static buildBbox(position, distance = 1000) {
        const southEast = position.getPointBy(new Vector(distance, 225));
        const northWest = position.getPointBy(new Vector(distance, 45));
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
            tower: airport.tower === "T",
            beacon: airport.beacon === "B",
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
