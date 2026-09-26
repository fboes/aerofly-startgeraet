import { BaseStateSubscriberWebComponent } from "../util/StateSubscriberWebComponent.base.js";
import { registerElement } from "../../renderer/registerElement.js";
import { numberFormat } from "../util/numberFormat.js";
import { getTimeFormat, getTimeFunction } from "../../../core/formatter/getTimeString.js";
import { html } from "../../../core/formatter/html.js";

export class FlightBriefingWebComponent extends BaseStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        tbody: HTMLTableSectionElement;
        duration: HTMLSpanElement;
        skyvectorOrigin: HTMLAnchorElement;
        skyvectorDestination: HTMLAnchorElement;
        skyvectorRoute: HTMLAnchorElement;
    };

    private initialize() {
        this.setAttribute("aria-role", "region");

        this.innerHTML = `\
<h3><startgeraet-icon icon="airplane"></startgeraet-icon>&nbsp;<span>Flight briefing</span></h3>

<table class="w-100">
    <thead>
        <tr>
            <th rowspan="2">Waypoint<br />Frequency</th>
            <th rowspan="2">Altitude</th>
            <th>Track</th>
            <th rowspan="2">Ground<br />speed</th>
            <th rowspan="2">Distance</th>
            <th>ETE<sup>1</sup></th>
        </tr>
        <tr>
            <th>Heading</th>
            <th>ETO<sup>1</sup></th>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>

<p><sup>1</sup>) Duration in <span id="briefing-duration"></span></p>

<ul>
    <li><a href="#" id="briefing-skyvector-origin">Information for ORIGIN</a></li>
    <li><a href="#" id="briefing-skyvector-destination">Information for DESTINATION</a></li>
    <li><a href="#" id="briefing-skyvector-route">Flightplan ORIGIN - DESTINATION</a></li>
</ul>

        `;
        this.elements = {
            tbody: this.querySelector("tbody") as HTMLTableSectionElement,
            duration: this.querySelector("#briefing-duration") as HTMLSpanElement,
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
    <th rowspan="2">
        ${html(l.to)}
        ${
            l.frequency_mhz
                ? `<br /><small>${this.htmlNumericOutput(
                      l.frequency_mhz > 1 ? l.frequency_mhz : l.frequency_mhz / 1000,
                      l.frequency_mhz > 1 ? " MHz" : " kHZ",
                      l.frequency_mhz > 1 ? 1 : 0,
                  )}</small>`
                : ""
        }
    </th>
    <td rowspan="2">${l.altitude_ft ? this.htmlNumericOutput(l.altitude_ft, " ft") : ""}</td>
    <td>${this.htmlNumericOutput(l.track_deg, "°")}</td>
    <td rowspan="2">${this.htmlNumericOutput(l.groundSpeed_kts, " kts")}</td>
    <td rowspan="2">${this.htmlNumericOutput(l.distance_nm, " NM", 1)}</td>
    <td>${html(timeFunction(l.estimatedTimeEnroute_min))}</td>
</tr>
<tr>
    <td>${this.htmlNumericOutput(l.heading_deg, "°")}</td>
    <td>${html(timeFunction(l.estimatedTimeEnrouteTotal_min))}</td>
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
    <td rowspan="2"></td>
    <td rowspan="2"></td>
    <td>${html(timeFunction(0))}</td>
</tr>
<tr>
    <td></td>
    <td>${html(timeFunction(0))}</td>
</tr>
`;

            this.elements.tbody.innerHTML = firstlegTr + trs.join("\n");
            this.elements.duration.innerText = getTimeFormat(routeTotalTime);

            this.elements.skyvectorOrigin.href = state.route.departureAirportUrl;
            this.elements.skyvectorOrigin.innerText = `SkyVector airport information for ${state.route.departureAirport}`;

            this.elements.skyvectorDestination.href = state.route.destinationAirportUrl;
            this.elements.skyvectorDestination.innerText = `SkyVector airport information for ${state.route.destinationAirport}`;

            this.elements.skyvectorRoute.href = state.route.routeUrl;
            this.elements.skyvectorRoute.innerText = `SkyVector flight plan for route ${state.route.departureAirportCode} to ${state.route.destinationAirportCode}`;
        });
    }

    private htmlNumericOutput(value: number, unit: string = "", minimumFractionDigits = 0): string {
        return html(numberFormat(value, minimumFractionDigits) + unit);
    }

    static registerElement() {
        registerElement("startgeraet-flight-briefing", FlightBriefingWebComponent);
    }
}
