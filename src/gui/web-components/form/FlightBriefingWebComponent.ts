import { BaseStateSubscriberWebComponent } from "../util/StateSubscriberWebComponent.base.js";
import { registerElement } from "../../renderer/registerElement.js";
import { numberFormat } from "../util/numberFormat.js";
import { getTimeFormat, getTimeFunction } from "../../../core/formatter/getTimeString.js";
import { htmlTableCells, htmlTableRows } from "../../../core/formatter/html.js";

export class FlightBriefingWebComponent extends BaseStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        tbody: HTMLTableSectionElement;
        duration: HTMLSpanElement;
    };

    private initialize() {
        this.setAttribute("aria-role", "region");

        const ths = htmlTableCells(
            ["From", "To", "Freq²", "Altitude²", "Track", "HDG", "GS", "Dist", "ETE³", "ETO³"],
            "th",
        );

        this.innerHTML = `\
<h3><startgeraet-icon icon="airplane"></startgeraet-icon>&nbsp;<span>Flight briefing</span></h3>

<table class="w-100">
    <thead>
        <tr>${ths}</tr>
    </thead>
    <tbody>
    </tbody>
</table>


<p>
    ²) Value for "To" waypoint<br />
    ³) Duration in <span class="duration"></span>
</p>
        `;
        this.elements = {
            tbody: this.querySelector("tbody") as HTMLTableSectionElement,
            duration: this.querySelector(".duration") as HTMLSpanElement,
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.subscribeToStateUpdates((state) => {
            const routeTotalTime = state.route.flightTime.hours * 60 + state.route.flightTime.minutes;
            const timeFunction = getTimeFunction(routeTotalTime);
            const trs = state.route.routeLegs.map((l) => [
                l.from,
                l.to,
                l.frequency_mhz
                    ? this.numericOutput(
                          l.frequency_mhz > 1 ? l.frequency_mhz : l.frequency_mhz / 1000,
                          l.frequency_mhz > 1 ? " MHz" : " kHZ",
                          l.frequency_mhz > 1 ? 1 : 0,
                      )
                    : "",
                l.altitude_ft ? this.numericOutput(l.altitude_ft, " ft") : "",
                this.numericOutput(l.track_deg, "°"),
                this.numericOutput(l.heading_deg, "°"),
                this.numericOutput(l.groundSpeed_kts, " kts"),
                this.numericOutput(l.distance_nm, " NM", 1),
                timeFunction(l.estimatedTimeEnroute_min),
                timeFunction(l.estimatedTimeEnrouteTotal_min),
            ]);
            this.elements.tbody.innerHTML = htmlTableRows(trs, "td");

            this.elements.duration.innerText = getTimeFormat(routeTotalTime);
        });
    }

    private numericOutput(value: number, unit: string = "", minimumFractionDigits = 0): string {
        return numberFormat(value, minimumFractionDigits) + unit;
    }

    static registerElement() {
        registerElement("startgeraet-flight-briefing", FlightBriefingWebComponent);
    }
}
