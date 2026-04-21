export class GeoCoordinates {
    lon;
    lat;
    constructor(lon, lat) {
        this.lon = lon;
        this.lat = lat;
    }
    get lonRad() {
        return (this.lon / 180) * Math.PI;
    }
    get latRad() {
        return (this.lat / 180) * Math.PI;
    }
    get lonMinute() {
        return this.convertMinute(this.lon);
    }
    get latMinute() {
        return this.convertMinute(this.lat);
    }
    /**
     * Returns E or W
     */
    get lonHemisphere() {
        return this.lon > 0 ? "E" : "W";
    }
    /**
     * Returns N or S
     */
    get latHemisphere() {
        return this.lat > 0 ? "N" : "S";
    }
    convertMinute(lonOrLat) {
        const l = {
            degree: lonOrLat > 0 ? Math.floor(lonOrLat) : Math.ceil(lonOrLat),
            minutes: 0,
            minutesDecimal: (Math.abs(lonOrLat) % 1) * 60,
            seconds: 0,
            secondsDecimal: 0,
        };
        l.secondsDecimal = (l.minutesDecimal % 1) * 60;
        l.seconds = Math.floor(l.secondsDecimal);
        l.minutes = Math.floor(l.minutesDecimal);
        return l;
    }
    toString(fractionDigits = 6) {
        return this.lon.toFixed(fractionDigits) + " " + this.lat.toFixed(fractionDigits);
    }
}
