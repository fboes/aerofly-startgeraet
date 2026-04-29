const makeInactiveOnZero = (el) => {
    el.closest("tr, div")?.classList?.toggle("inactive", el.value === "" || el.value === "0");
};
document.querySelectorAll("#clouds-0-coverage, #clouds-1-coverage, #clouds-2-coverage, #wind-gust").forEach((e) => {
    e.addEventListener("input", (ev) => {
        makeInactiveOnZero(ev.currentTarget);
    });
    makeInactiveOnZero(e);
});

// -----------------------------------------------------------------------------

const temperatureFahrenheit = document.getElementById("temperature-fahrenheit");
const temperatureCelsius = document.getElementById("temperature-celsius");
if (temperatureFahrenheit && temperatureCelsius) {
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
if (visibilitySm && visibilityMeters) {
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
windDirection?.addEventListener("input", () => {
    windDirection.valueAsNumber = (windDirection.valueAsNumber + 360) % 360;
});

// -----------------------------------------------------------------------------
const elements = {
    dateUtc: document.getElementById("date-utc"),
    timeUtc: document.getElementById("time-utc"),
    dateLocal: document.getElementById("date-local"),
    timeLocal: document.getElementById("time-local"),
    timeZoneLocal: document.getElementById("timezone-local"),
};
if (elements.dateUtc && elements.timeUtc && elements.dateLocal && elements.timeLocal && elements.timeZoneLocal) {
    const pad = (t) => String(t).padStart(2, "0");
    const utcToLocal = () => {
        const d = new Date(elements.dateUtc.value + "T" + elements.timeUtc.value + "Z");
        d.setUTCHours(d.getUTCHours() + Number(elements.timeZoneLocal.dataset.value || "0"));
        elements.timeLocal.value = pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes());
        elements.dateLocal.value =
            d.getFullYear().toString() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
    };
    const localToUtc = () => {
        const d = new Date(elements.dateLocal.value + "T" + elements.timeLocal.value + "Z");
        d.setUTCHours(d.getUTCHours() - Number(elements.timeZoneLocal.dataset.value || "0"));
        elements.timeUtc.value = pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes());
        elements.dateUtc.value =
            d.getFullYear().toString() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
    };

    [elements.dateUtc, elements.timeUtc].forEach((e) => e.addEventListener("input", utcToLocal));
    [elements.dateLocal, elements.timeLocal].forEach((e) => e.addEventListener("input", localToUtc));

    utcToLocal();
}
