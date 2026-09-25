export function getHourString(minutes: number): string {
    return getMinuteString(minutes / 60);
}

export function getMinuteString(minutes: number): string {
    return `${Math.floor(minutes).toFixed()}:${Math.floor((minutes * 60) % 60)
        .toString()
        .padStart(2, "0")}`;
}

export function getTimeFunction(minutes: number): (minutes: number) => string {
    return minutes < 60 ? getMinuteString : getHourString;
}

export function getTimeFormat(minutes: number): string {
    return minutes < 60 ? "mm:ss" : "hh:mm";
}
