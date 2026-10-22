/**
 * @returns a number between >=0 and <360
 */
export function degreeNormalize(degree: number): number {
    return (degree + 360) % 360;
}

export function degreeToRad(degree: number): number {
    return (degree / 180) * Math.PI;
}

/**
 * @returns a number between -180 and +180
 */
export function degreeDifference(fromDegree: number, toDegree: number): number {
    let result = toDegree - fromDegree;
    while (result > 180) {
        result -= 360;
    }
    while (result < -180) {
        result += 360;
    }

    return result;
}
