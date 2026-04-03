export class SunPosition {
    /**
     * Simplified elevation/ azimuth calculation
     */
    static getSunPosition(utcHours, dayOfYear, latitude, longitude) {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const toDeg = (rad) => (rad * 180) / Math.PI;
        const declination = toRad(-23.45 * Math.cos(toRad((360 / 365) * (dayOfYear + 10))));
        const hourAngle = toRad((utcHours - 12) * 15 + longitude);
        const lat = toRad(latitude);
        const sinElev = Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
        const elevation = toDeg(Math.asin(sinElev));
        const cosAz = (Math.sin(declination) - Math.sin(toRad(elevation)) * Math.sin(lat)) /
            (Math.cos(toRad(elevation)) * Math.cos(lat));
        let azimuth = toDeg(Math.acos(Math.max(-1, Math.min(1, cosAz))));
        if (Math.sin(hourAngle) > 0)
            azimuth = 360 - azimuth;
        return {
            elevation: Math.round(elevation * 10) / 10,
            azimuth: Math.round(azimuth * 10) / 10,
        };
    }
    static dayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        return Math.floor(diff / 86400000);
    }
}
