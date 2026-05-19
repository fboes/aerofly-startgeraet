import { Vector, Point } from "@fboes/geojson";
export class AviationWeatherApi {
    async fetchMetar(ids, date = null) {
        return this.doRequest("/api/data/metar", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // taf,
            // hours,
            // bbox: this.buildBbox(longitude, latitude, distance).join(","),
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
    async fetchMetarByPosition(longitude, latitude, distance = 1000, date = null) {
        return this.doRequest("/api/data/metar", new URLSearchParams({
            // ids: ids.join(","),
            format: "json",
            // taf,
            // hours,
            bbox: this.buildBbox(longitude, latitude, distance).join(","),
            date: date ? date.toISOString().replace(/\.\d+(Z)/, "$1") : "",
        }));
    }
    async fetchAirports(ids) {
        return this.doRequest("/api/data/airport", new URLSearchParams({
            ids: ids.join(","),
            // bbox: this.buildBbox(longitude, latitude, distance).join(","),
            format: "json",
        })).then((data) => data.map((airport) => this.normalizeAirport(airport)));
    }
    async fetchNavaids(ids) {
        return this.doRequest("/api/data/navaid", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // bbox: this.buildBbox(longitude, latitude, distance).join(","),
        })).then((data) => data.map((navaid) => this.normalizeNavAid(navaid)));
    }
    async fetchFix(ids) {
        return this.doRequest("/api/data/fix", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // bbox: this.buildBbox(longitude, latitude, distance).join(","),
        }));
    }
    /**
     * @param {number} longitude center of search area
     * @param {number} latitude center of search area
     * @param distance in meters, default 1000
     * @see https://aviationweather.gov/data/api/#/Data/dataNavaid
     * @returns {Promise<AviationWeatherApiNavaid[]>}
     */
    async fetchNavaidsByPosition(longitude, latitude, distance = 1000) {
        return this.doRequest("/api/data/navaid", new URLSearchParams({
            // ids: ids.join(","),
            format: "json",
            bbox: this.buildBbox(longitude, latitude, distance).join(","),
        })).then((data) => data.map((navaid) => this.normalizeNavAid(navaid)));
    }
    async fetchFixByPosition(longitude, latitude, distance = 1000) {
        return this.doRequest("/api/data/fix", new URLSearchParams({
            // ids: ids.join(","),
            format: "json",
            bbox: this.buildBbox(longitude, latitude, distance).join(","),
        }));
    }
    normalizeNavAid(navaid) {
        return {
            ...navaid,
            lat: Number(navaid.lat),
            lon: Number(navaid.lon),
            elev: Number(navaid.elev),
            freq: Number(navaid.freq),
            freq_unit: navaid.type === "NDB" ? "kHz" : "MHz",
            mag_dec: this.magDecConverter(navaid.mag_dec),
        };
    }
    async doRequest(route, query, timeoutMs = 5000) {
        const url = new URL(route + "?" + query.toString(), "https://aviationweather.gov");
        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
            },
            signal: AbortSignal.timeout(timeoutMs),
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
    buildBbox(longitude, latitude, distance = 1000) {
        const position = new Point(longitude, latitude);
        const southEast = position.getPointBy(new Vector(distance * 1.41, 225));
        const northWest = position.getPointBy(new Vector(distance * 1.41, 45));
        return [southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude];
    }
    normalizeAirport(airport) {
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
            magdec: this.magDecConverter(airport.magdec),
            rwyNum: Number(airport.rwyNum),
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
    normalizeWeather(weather) {
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
    /**
     * @returns {number} with "+" to the east and "-" to the west. Substracted from a true heading this will give the magnetic heading.
     */
    magDecConverter(magdec) {
        let magDec = 0;
        const magdecMatch = magdec.match(/^(\d+)(E|W)$/);
        if (magdecMatch) {
            magDec = Number(magdecMatch[1]);
            if (magdecMatch[2] === "W") {
                magDec *= -1;
            }
        }
        return magDec;
    }
}
