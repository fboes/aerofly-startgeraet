import { BaseStateSubscriberWebComponent } from "../util/StateSubscriberWebComponent.base.js";
import { registerElement } from "../../renderer/registerElement.js";
import { numberFormat } from "../util/numberFormat.js";
import { getTimeFormat, getTimeFunction } from "../../../core/formatter/getTimeString.js";
import { html } from "../../../core/formatter/html.js";
import { fmt } from "../../../core/formatter/format.js";

export class FlightBriefingWebComponent extends BaseStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        title: HTMLSpanElement;
        description: HTMLParagraphElement;
        tbody: HTMLTableSectionElement;
        flightTimeUnit: HTMLSpanElement;
        skyvectorOrigin: HTMLAnchorElement;
        skyvectorDestination: HTMLAnchorElement;
        skyvectorRoute: HTMLAnchorElement;
    };

    private initialize() {
        this.setAttribute("aria-role", "region");
        this.setAttribute("aria-live", "off"); // changes to the element's content are only supposed to be announced when focus is on, or inside, the element.

        this.innerHTML = `\
<h3><startgeraet-icon icon="airplane"></startgeraet-icon>&nbsp;<span id="briefing-title">Flight briefing</span></h3>

<p id="briefing-description"></p>

<table class="w-100">
    <thead>
        <tr>
            <th>Waypoint</th>
            <th rowspan="2">Altitude</th>
            <th>Track<sup>1</sup></th>
            <th><abbr title="True Airspeed">TAS</abbr></th>
            <th>Distance</th>
            <th><abbr title="Estimated Time Enroute">ETE</abbr><sup>2</sup></th>
        </tr>
        <tr>
            <th>Frequency</th>
            <th>Heading<sup>1</sup></th>
            <th><abbr title="Ground Speed">GS</abbr></th>
            <th><abbr title="Cumulative distance">Σ Distance</abbr></th>
            <th><abbr title="Cumulative Estimated Time Enroute">Σ ETE</abbr><sup>2</sup></th>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>

<p class="legend">
    <sup>1</sup>) True track / true heading
    <sup>2</sup>) Flight time in <span id="briefing-flight-time-unit"></span>
</p>

<ul>
    <li><a target="skyvector" href="#" id="briefing-skyvector-origin">Information for ORIGIN</a></li>
    <li><a target="skyvector" href="#" id="briefing-skyvector-destination">Information for DESTINATION</a></li>
    <li><a target="skyvector" href="#" id="briefing-skyvector-route">Flightplan ORIGIN - DESTINATION</a></li>
</ul>

        `;
        this.elements = {
            title: this.querySelector("#briefing-title") as HTMLSpanElement,
            description: this.querySelector("#briefing-description") as HTMLParagraphElement,
            tbody: this.querySelector("tbody") as HTMLTableSectionElement,
            flightTimeUnit: this.querySelector("#briefing-flight-time-unit") as HTMLSpanElement,
            skyvectorOrigin: this.querySelector("#briefing-skyvector-origin") as HTMLAnchorElement,
            skyvectorDestination: this.querySelector("#briefing-skyvector-destination") as HTMLAnchorElement,
            skyvectorRoute: this.querySelector("#briefing-skyvector-route") as HTMLAnchorElement,
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
            const trs = state.route.routeLegs.map(
                (l) => `\
<tr>
    <th${l.frequency_mhz ? "" : ` rowspan="2"`}>
        ${l.type === "departure_runway" || l.type === "destination_runway" ? `<span title="Runway">▸</span>` : ""}
        ${html(l.to)}
    </th>
    <td rowspan="2">${l.altitude_ft ? this.htmlNumericOutput(l.altitude_ft, " ft") : ""}</td>
    <td>${this.htmlNumericOutput(l.track_deg, "°")}</td>
    <td>${this.htmlNumericOutput(l.trueAirspeed_kts, " kts")}</td>
    <td>${this.htmlNumericOutput(l.distance_nm, " NM", 1)}</td>
    <td>${html(
        l.estimatedTimeEnroute_min === 0 && (l.type === "departure_runway" || l.type === "destination")
            ? "TAXI"
            : timeFunction(l.estimatedTimeEnroute_min),
    )}</td>
</tr>
<tr>
    ${
        l.frequency_mhz
            ? `<td><small>${this.htmlNumericOutput(
                  l.frequency_mhz > 1 ? l.frequency_mhz : l.frequency_mhz * 1000,
                  l.frequency_mhz > 1 ? " MHz" : " kHZ",
                  l.frequency_mhz > 1 ? 1 : 0,
              )}</small></td>`
            : ""
    }
    <td><span class="prefix">~</span>${this.htmlNumericOutput(l.heading_deg, "°")}</td>
    <td><span class="prefix">~</span>${this.htmlNumericOutput(l.groundSpeed_kts, " kts")}</td>
    <td><span class="prefix">Σ</span>${this.htmlNumericOutput(l.distanceCumulative_nm, " NM", 1)}</td>
    <td><span class="prefix">Σ</span>${html(timeFunction(l.estimatedTimeEnrouteCumulative_min))}</td>
</tr>
`,
            );

            const l = state.route.routeLegs.at(0);
            if (!l) {
                return;
            }

            const firstlegTr = `\
<tr>
    <th rowspan="2">
        ${html(l.from)}
    </th>
    <td rowspan="2">${l.altitude_ft ? this.htmlNumericOutput(l.altitude_ft, " ft") : ""}</td>
    <td></td>
    <td></td>
    <td rowspan="2"></td>
    <td>${html(timeFunction(0))}</td>
</tr>
<tr>
    <td></td>
    <td></td>
    <td>${html(timeFunction(0))}</td>
</tr>
`;

            this.elements.tbody.innerHTML = firstlegTr + trs.join("\n");
            this.elements.flightTimeUnit.innerText = getTimeFormat(routeTotalTime);

            this.elements.skyvectorOrigin.href = state.route.departureAirportUrl;
            this.elements.skyvectorOrigin.innerText = fmt(`SkyVector airport information for {{ departureAirport }}`, {
                departureAirport: state.route.departureAirport,
            });

            this.elements.skyvectorDestination.href = state.route.destinationAirportUrl;
            this.elements.skyvectorDestination.innerText = fmt(
                `SkyVector airport information for {{ destinationAirport }}`,
                { destinationAirport: state.route.destinationAirport },
            );
            this.elements.skyvectorDestination.parentElement?.classList.toggle(
                "d-none",
                state.route.departureAirportCode === state.route.destinationAirportCode,
            );

            this.elements.skyvectorRoute.href = state.route.routeUrl;
            this.elements.skyvectorRoute.innerText = fmt(
                `SkyVector flight plan for route {{ departureAirportCode }} to {{ destinationAirportCode }}`,
                {
                    departureAirportCode: state.route.departureAirportCode,
                    destinationAirportCode: state.route.destinationAirportCode,
                },
            );

            this.elements.title.innerText = state.aeroflyFlight._missionTitle || "Flight briefing";
            this.elements.description.classList.toggle("d-none", state.aeroflyFlight._missionBriefing.trim() === "");
            this.elements.description.innerText = state.aeroflyFlight._missionBriefing.trim();
            this.elements.description.innerHTML = this.elements.description.innerHTML.replace(/\n/g, "<br />");
        });
    }

    private htmlNumericOutput(value: number, unit: string = "", minimumFractionDigits = 0): string {
        return html(numberFormat(value, minimumFractionDigits) + unit);
    }

    static registerElement() {
        registerElement("startgeraet-flight-briefing", FlightBriefingWebComponent);
    }
}
