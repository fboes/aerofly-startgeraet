const makeInactiveOnZero = (el) => {
    el.closest("tr, div")?.classList?.toggle("inactive", el.value === "" || el.value === "0");
};
document
    .querySelectorAll("#clouds-0-coverage, #clouds-1-coverage, #clouds-2-coverage, #wind-gust")
    .forEach((e) => {
    e.addEventListener("input", () => {
        makeInactiveOnZero(e);
    });
    makeInactiveOnZero(e);
});
// -----------------------------------------------------------------------------
const temperatureFahrenheit = document.getElementById("temperature-fahrenheit");
const temperatureCelsius = document.getElementById("temperature-celsius");
if (temperatureFahrenheit instanceof HTMLInputElement && temperatureCelsius instanceof HTMLInputElement) {
    temperatureFahrenheit.addEventListener("input", () => {
        temperatureCelsius.valueAsNumber = Math.round((temperatureFahrenheit.valueAsNumber - 32) * (5 / 9));
    });
    temperatureCelsius.addEventListener("input", () => {
        temperatureFahrenheit.valueAsNumber = Math.round(temperatureCelsius.valueAsNumber * 1.8 + 32);
    });
    temperatureFahrenheit.valueAsNumber = Math.round(temperatureCelsius.valueAsNumber * 1.8 + 32);
}
// -----------------------------------------------------------------------------
const visibilitySm = document.getElementById("visibility-sm");
const visibilityMeters = document.getElementById("visibility-meters");
if (visibilitySm instanceof HTMLInputElement && visibilityMeters instanceof HTMLInputElement) {
    visibilitySm.addEventListener("input", () => {
        visibilityMeters.valueAsNumber = Math.round((visibilitySm.valueAsNumber * 1609.344) / 100) * 100;
    });
    visibilityMeters.addEventListener("input", () => {
        visibilitySm.valueAsNumber =
            visibilityMeters.valueAsNumber === 9999
                ? 10
                : Math.round(visibilityMeters.valueAsNumber / 1609.344 / 0.25) * 0.25;
    });
    visibilitySm.valueAsNumber =
        visibilityMeters.valueAsNumber === 9999
            ? 10
            : Math.round(visibilityMeters.valueAsNumber / 1609.344 / 0.25) * 0.25;
}
// -----------------------------------------------------------------------------
const windDirection = document.getElementById("wind-direction");
if (windDirection instanceof HTMLInputElement) {
    windDirection.addEventListener("input", () => {
        windDirection.valueAsNumber = (windDirection.valueAsNumber + 360) % 360;
    });
}
// -----------------------------------------------------------------------------
const dateUtc = document.getElementById("date-utc");
const timeUtc = document.getElementById("time-utc");
const dateLocal = document.getElementById("date-local");
const timeLocal = document.getElementById("time-local");
const timeZoneLocal = document.getElementById("timezone-local");
if (dateUtc instanceof HTMLInputElement &&
    timeUtc instanceof HTMLInputElement &&
    dateLocal instanceof HTMLInputElement &&
    timeLocal instanceof HTMLInputElement &&
    timeZoneLocal instanceof HTMLElement) {
    const pad = (t) => String(t).padStart(2, "0");
    const utcToLocal = () => {
        const d = new Date(dateUtc.value + "T" + timeUtc.value + "Z");
        d.setUTCHours(d.getUTCHours() + Number(timeZoneLocal.dataset.value ?? "0"));
        timeLocal.value = pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes());
        dateLocal.value = d.getFullYear().toString() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
    };
    const localToUtc = () => {
        const d = new Date(dateLocal.value + "T" + timeLocal.value + "Z");
        d.setUTCHours(d.getUTCHours() - Number(timeZoneLocal.dataset.value ?? "0"));
        timeUtc.value = pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes());
        dateUtc.value = d.getFullYear().toString() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
    };
    [dateUtc, timeUtc].forEach((e) => e.addEventListener("input", utcToLocal));
    [dateLocal, timeLocal].forEach((e) => e.addEventListener("input", localToUtc));
    utcToLocal();
}
export {};
