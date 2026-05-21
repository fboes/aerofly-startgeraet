import { sendToMain } from "../../renderer/sendToMain.js";
export class TimeAndDateWebComponent extends HTMLElement {
    elements;
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
    <tr class="form-group">
      <th scope="row">UTC</th>
      <td><input id="date-utc" title="Date (UTC)" type="date" value="2026-01-01" /></td>
      <td><input id="time-utc" title="Time (UTC)" type="time" value="00:00" /></td>
      <td rowspan="2">
        <button id="synchronize-time" class="w-100" title="Use current time &amp; date">Now</button>
      </td>
    </tr>
    <tr class="form-group">
      <th scope="row">
        Local (<span id="timezone-local" data-value="0" title="Nautical time">0</span>)<sup></sup>
      </th>
      <td><input id="date-local" title="Date (Local)" type="date" value="2026-01-01" /></td>
      <td><input id="time-local" title="Time (Local)" type="time" value="00:00" /></td>
    </tr>
  </tbody>
</table>
        `;
        this.elements = {
            dateUtc: document.getElementById("date-utc"),
            timeUtc: document.getElementById("time-utc"),
            dateLocal: document.getElementById("date-local"),
            timeLocal: document.getElementById("time-local"),
            timeZoneLocal: document.getElementById("timezone-local"),
            nowButton: document.getElementById("synchronize-time"),
        };
    }
    get state() {
        return {
            utcDate: this.elements.dateUtc.value,
            utcTime: this.elements.timeUtc.value,
        };
    }
    connectedCallback() {
        [this.elements.dateUtc, this.elements.timeUtc].forEach((e) => e.addEventListener("input", () => this.setLocalFromUtc()));
        [this.elements.dateLocal, this.elements.timeLocal].forEach((e) => e.addEventListener("input", () => this.setUtcFromLocal()));
        this.elements.nowButton.addEventListener("click", () => {
            this.setNow();
        });
        window.electronAPI.onStateUpdate((state) => {
            this.elements.dateUtc.value = state.dateTime.utc.date;
            this.elements.timeUtc.value = state.dateTime.utc.time;
            this.elements.timeZoneLocal.dataset.value = state.dateTime.local.timeZoneOffset_h.toString();
            this.elements.timeZoneLocal.textContent =
                (state.dateTime.local.timeZoneOffset_h >= 0 ? "+" : "") + state.dateTime.local.timeZoneOffset_h;
            this.elements.dateLocal.value = state.dateTime.local.date;
            this.elements.timeLocal.value = state.dateTime.local.time;
        });
        this.addEventListener("input", () => this.handleChange());
    }
    handleChange() {
        sendToMain("date-time:set", this.state);
    }
    setLocalFromUtc() {
        const d = new Date(this.elements.dateUtc.value + "T" + this.elements.timeUtc.value + "Z");
        d.setUTCHours(d.getUTCHours() + Number(this.elements.timeZoneLocal.dataset.value ?? "0"));
        this.elements.timeLocal.value = this.pad(d.getUTCHours()) + ":" + this.pad(d.getUTCMinutes());
        this.elements.dateLocal.value =
            d.getFullYear().toString() + "-" + this.pad(d.getUTCMonth() + 1) + "-" + this.pad(d.getUTCDate());
    }
    setUtcFromLocal() {
        const d = new Date(this.elements.dateLocal.value + "T" + this.elements.timeLocal.value + "Z");
        d.setUTCHours(d.getUTCHours() - Number(this.elements.timeZoneLocal.dataset.value ?? "0"));
        this.elements.timeUtc.value = this.pad(d.getUTCHours()) + ":" + this.pad(d.getUTCMinutes());
        this.elements.dateUtc.value =
            d.getFullYear().toString() + "-" + this.pad(d.getUTCMonth() + 1) + "-" + this.pad(d.getUTCDate());
    }
    setNow() {
        const now = new Date();
        this.elements.dateUtc.value =
            now.getUTCFullYear().toString() + "-" + this.pad(now.getUTCMonth() + 1) + "-" + this.pad(now.getUTCDate());
        this.elements.timeUtc.value = this.pad(now.getUTCHours()) + ":" + this.pad(now.getUTCMinutes());
        this.setLocalFromUtc();
        this.handleChange();
    }
    pad(t) {
        return String(t).padStart(2, "0");
    }
    static registerElement() {
        customElements.define("startgeraet-time-and-date", TimeAndDateWebComponent);
    }
}
