const output = document.getElementById("datetime");

const now = new Date();

document.getElementById("time").setAttribute("default", now.getUTCHours() * 60 + now.getUTCMinutes());
document.getElementById("time").addEventListener("change", (event) => {
  output.setAttribute("value-hour", event.currentTarget.value);
});

const day = (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(now.getUTCFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
document.getElementById("date").setAttribute("default", day);
document.getElementById("date").addEventListener("change", (event) => {
  output.setAttribute("value-dayofyear", event.currentTarget.value);
});

document.getElementById("wind").addEventListener("change", (event) => {
  document.getElementById("windy").value = `${String(
    event.currentTarget.value
  ).padStart(3, "0")}° @ ${event.currentTarget.value2}kn`;
});

document.getElementById("cloud").addEventListener("change", (event) => {
  const getCoverCode = (cover) => {
    const octas = Math.round(cover / 100 * 8);

    if (octas < 1) {
      return "CLR";
    } else if (octas <= 2) {
      return "FEW";
    } else if (octas <= 4) {
      return "SCT";
    } else if (octas <= 7) {
      return "BKN";
    }
    return "OVC";
  }

  document.getElementById("cloudy").value = `${event.currentTarget.value}% (${getCoverCode(event.currentTarget.value)}) @ ${(event.currentTarget.value2 * 100).toLocaleString()}ft`;
});