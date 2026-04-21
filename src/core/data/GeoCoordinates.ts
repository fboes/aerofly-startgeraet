type LonLatMinute = {
    degree: number;
    minutes: number;
    minutesDecimal: number;
    seconds: number;
    secondsDecimal: number;
};

export class GeoCoordinates {
    constructor(
        public lon: number,
        public lat: number,
    ) {}

    get lonRad(): number {
        return (this.lon / 180) * Math.PI;
    }

    get latRad(): number {
        return (this.lat / 180) * Math.PI;
    }

    get lonMinute(): LonLatMinute {
        return this.convertMinute(this.lon);
    }

    get latMinute(): LonLatMinute {
        return this.convertMinute(this.lat);
    }

    /**
     * Returns E or W
     */
    get lonHemisphere(): "E" | "W" {
        return this.lon > 0 ? "E" : "W";
    }

    /**
     * Returns N or S
     */
    get latHemisphere(): "N" | "S" {
        return this.lat > 0 ? "N" : "S";
    }

    protected convertMinute(lonOrLat: number): LonLatMinute {
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

    toString(fractionDigits = 6): string {
        return this.lon.toFixed(fractionDigits) + " " + this.lat.toFixed(fractionDigits);
    }
}
