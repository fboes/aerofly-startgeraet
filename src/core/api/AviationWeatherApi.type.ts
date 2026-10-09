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

export type AviationWeatherApiTaf = {
    icaoId: string;
    issueTime: string;
    lat: number;
    lon: number;
    elev: number;
    fcsts: AviationWeatherApiTafForecast[];
};

export type AviationWeatherApiTafForecast = {
    /**
     * Timestamp
     */
    timeFrom: number;
    /**
     * Timestamp
     */
    timeTo: number;
    wdir: "VRB" | number | null;
    wspd: number | null;
    wgst: number | null;
    visib: string | number | null;
    altim: number | null;
    clouds: AviationWeatherApiCloud[];
    temp: number[];
};

export type AviationWeatherApiNormalizedTaf = {
    icaoId: string;
    issueTime: string;
    lat: number;
    lon: number;
    elev: number;
    fcsts: AviationWeatherApiNormalizedTafForecast[];
};

export type AviationWeatherApiNormalizedTafForecast = {
    timeFrom: Date;
    timeTo: Date;
    wdir: number | null;
    wspd: number | null;
    wgst: number | null;
    visib: number | null;
    altim: number | null;
    clouds: AviationWeatherNormalizedCloud[];
    temp: number[];
};

export type AviationWeatherApiRunwaySurface = "A" | "C" | "G" | "W" | "T" | "H";

/**
 * @see https://aviationweather.gov/data/api/#/Data/dataAirport
 */
export type AviationWeatherApiRunway = {
    id: string;
    dimension: string;
    surface: AviationWeatherApiRunwaySurface;
    alignment: string;
};

export type AviationWeatherNormalizedRunway = {
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
    services: "S" | "-" | null;
    tower: "T" | "-" | null;
    beacon: "B" | "-" | null;
    passengers: string;
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
    rwyNum: number;
    services: boolean;
    tower: boolean;
    beacon: boolean;
    passengers: number;
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
     * with "+" to the east and "-" to the west. Subtracted from a true heading this will give the magnetic heading.
     */
    mag_dec: number;
};

export type AviationWeatherApiFix = {
    id: string;
    type: "I" | "L" | "H" | "S" | "D" | "-";
    lat: number;
    lon: number;
};
