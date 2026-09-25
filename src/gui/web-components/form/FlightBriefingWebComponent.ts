import { BaseStateSubscriberWebComponent } from "../util/StateSubscriberWebComponent.base.js";
import { registerElement } from "../../renderer/registerElement.js";
import { numberFormat } from "../util/numberFormat.js";
import { getTimeFunction } from "../../../core/formatter/getTimeString.js";

export class FlightBriefingWebComponent extends BaseStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        tbody: HTMLTableSectionElement;
    };

    private initialize() {
        this.setAttribute("aria-role", "region");

        const ths = ["From", "To", "Freq²", "Altitude²", "Track", "HDG", "GS", "Dist", "ETE³", "ETO³"].join(
            "</th><th>",
        );

        this.innerHTML = `\
<h3><startgeraet-icon icon="airplane"></startgeraet-icon>&nbsp;<span>Flight briefing</span></h3>

<table class="w-100">
    <thead>
        <tr>
            <th>${ths}</th>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>


<p>
    ²) Value for "To" waypoint<br />
    ³) Duration
</p>
        `;
        this.elements = {
            tbody: this.querySelector("tbody") as HTMLTableSectionElement,
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
            const trs = state.route.routeLegs
                .map((l) =>
                    [
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
                    ].join("</td>\n  <td>"),
                )
                .join("</td>\n</tr>\n<tr>\n  <td>");
            this.elements.tbody.innerHTML = `<tr><td>${trs}</td></tr>`;

            // getTimeFormat(routeTotalTime)
        });
    }

    private numericOutput(value: number, unit: string = "", minimumFractionDigits = 0): string {
        return numberFormat(value, minimumFractionDigits) + unit;
    }

    static registerElement() {
        registerElement("startgeraet-flight-briefing", FlightBriefingWebComponent);
    }
}
