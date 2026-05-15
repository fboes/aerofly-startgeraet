export class TimeAndDateWebComponent extends HTMLElement {
    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>⏰ Time &amp; date</h3>

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Date</th>
      <th>Time</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">UTC</th>
      <td><input id="date-utc" title="Date (UTC)" type="date" value="2026-04-27" /></td>
      <td><input id="time-utc" title="Time (UTC)" type="time" value="23:12" /></td>
      <td rowspan="2">
        <button id="synchronize-time" class="w-100" title="Use current time &amp; date">Now</button>
      </td>
    </tr>
    <tr>
      <th scope="row">
        Local (<span id="timezone-local" data-value="-4" title="Nautical time">-4</span>)<sup></sup>
      </th>
      <td><input id="date-local" title="Date (Local)" type="date" value="2026-04-28" /></td>
      <td><input id="time-local" title="Time (Local)" type="time" value="01:12" /></td>
    </tr>
  </tbody>
</table>
        `;
    }
    connectedCallback() {
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
                dateLocal.value =
                    d.getFullYear().toString() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
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
    }
    static registerElement() {
        customElements.define("startgeraet-time-and-date", TimeAndDateWebComponent);
    }
}
