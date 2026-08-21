import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
import { registerShortcut, shortcutString } from "../../renderer/registerShortcut.js";

export type TimeAndDateWebComponentState = {
    utcDate: string; // YYYY-MM-DD
    utcTime: string; // HH:mm
};

export class TimeAndDateWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized = false;
    private shortcut: (() => void) | undefined = undefined;
    private readonly shortcutKey = "n";

    private elements!: {
        dateUtc: HTMLInputElement;
        timeUtc: HTMLInputElement;
        dateLocal: HTMLInputElement;
        timeLocal: HTMLInputElement;
        timeZoneLocal: HTMLElement;
        nowButton: HTMLButtonElement;
    };

    private initialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3><startgeraet-icon icon="clock"></startgeraet-icon>&nbsp;Time &amp; date</h3>

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
        <button id="synchronize-time" class="w-100" title="Use current time &amp; date, ${shortcutString(this.shortcutKey)}"><u>N</u>ow</button>
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
            dateUtc: this.querySelector("#date-utc") as HTMLInputElement,
            timeUtc: this.querySelector("#time-utc") as HTMLInputElement,
            dateLocal: this.querySelector("#date-local") as HTMLInputElement,
            timeLocal: this.querySelector("#time-local") as HTMLInputElement,
            timeZoneLocal: this.querySelector("#timezone-local") as HTMLElement,
            nowButton: this.querySelector("#synchronize-time") as HTMLButtonElement,
        };
    }

    get state(): TimeAndDateWebComponentState {
        return {
            utcDate: this.elements.dateUtc.value,
            utcTime: this.elements.timeUtc.value,
        };
    }

    get utcDate() {
        return new Date(this.elements.dateUtc.value + "T" + this.elements.timeUtc.value + "Z");
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        [this.elements.dateUtc, this.elements.timeUtc].forEach((e) =>
            e.addEventListener("input", this.setLocalFromUtc),
        );
        [this.elements.dateLocal, this.elements.timeLocal].forEach((e) =>
            e.addEventListener("input", this.setUtcFromLocal),
        );
        this.elements.nowButton.addEventListener("click", this.setNow);

        this.subscribeToStateUpdates((state) => {
            this.elements.dateUtc.value = state.dateTime.utc.date;
            this.elements.timeUtc.value = state.dateTime.utc.time;
            this.elements.timeZoneLocal.dataset.value = state.dateTime.local.timeZoneOffset_h.toString();
            this.elements.timeZoneLocal.textContent =
                (state.dateTime.local.timeZoneOffset_h >= 0 ? "+" : "") + state.dateTime.local.timeZoneOffset_h;
            this.elements.dateLocal.value = state.dateTime.local.date;
            this.elements.timeLocal.value = state.dateTime.local.time;
            this.elements.timeLocal.title = state.dateTime.local.sunPosition;
            this.checkWarning();
        });

        this.addEventListener("input", this.handleChange);
        this.shortcut = registerShortcut(this.shortcutKey, this.setNow);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        [this.elements.dateUtc, this.elements.timeUtc].forEach((e) =>
            e.removeEventListener("input", this.setLocalFromUtc),
        );
        [this.elements.dateLocal, this.elements.timeLocal].forEach((e) =>
            e.removeEventListener("input", this.setUtcFromLocal),
        );
        this.elements.nowButton.removeEventListener("click", this.setNow);
        this.removeEventListener("input", this.handleChange);
        if (this.shortcut) {
            this.shortcut();
        }
    }

    private checkWarning() {
        const now = new Date();
        const hasWarning = this.utcDate > now;
        const warningClass = "input-warning";
        this.elements.dateUtc.classList.toggle(warningClass, hasWarning);
        this.elements.timeUtc.classList.toggle(warningClass, hasWarning);
        this.elements.dateLocal.classList.toggle(warningClass, hasWarning);
        this.elements.timeLocal.classList.toggle(warningClass, hasWarning);
    }

    private handleChange = () => {
        this.checkWarning();
        sendToMain("date-time:set", this.state);
    };

    private setLocalFromUtc = () => {
        const d = this.utcDate;
        d.setUTCHours(d.getUTCHours() + Number(this.elements.timeZoneLocal.dataset.value ?? "0"));
        this.elements.timeLocal.value = this.pad(d.getUTCHours()) + ":" + this.pad(d.getUTCMinutes());
        this.elements.dateLocal.value =
            d.getFullYear().toString() + "-" + this.pad(d.getUTCMonth() + 1) + "-" + this.pad(d.getUTCDate());
    };

    private setUtcFromLocal = () => {
        const d = new Date(this.elements.dateLocal.value + "T" + this.elements.timeLocal.value + "Z");
        d.setUTCHours(d.getUTCHours() - Number(this.elements.timeZoneLocal.dataset.value ?? "0"));
        this.elements.timeUtc.value = this.pad(d.getUTCHours()) + ":" + this.pad(d.getUTCMinutes());
        this.elements.dateUtc.value =
            d.getFullYear().toString() + "-" + this.pad(d.getUTCMonth() + 1) + "-" + this.pad(d.getUTCDate());
    };

    private setNow = () => {
        const now = new Date();
        this.elements.dateUtc.value =
            now.getUTCFullYear().toString() + "-" + this.pad(now.getUTCMonth() + 1) + "-" + this.pad(now.getUTCDate());
        this.elements.timeUtc.value = this.pad(now.getUTCHours()) + ":" + this.pad(now.getUTCMinutes());
        this.setLocalFromUtc();
        this.handleChange();
    };

    private pad(t: string | number) {
        return String(t).padStart(2, "0");
    }

    static registerElement() {
        registerElement("startgeraet-time-and-date", TimeAndDateWebComponent);
    }
}
