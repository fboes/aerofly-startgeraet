export class SimformInputRound extends HTMLElement {
    static observedAttributes = [
        "max",
        "max2",
        "value",
        "value2",
        "default",
        "default2",
        "width",
        "padding",
        "ticks",
        "ticks2",
    ];

    _width = 128;
    _padding = 5;
    _knobDiameter = 18;
    _max = 100;
    _max2 = 0;
    _value = 0;
    _value2 = 0;
    _default = 0;
    _default2 = 0;
    _isChangeMode = false;
    _ticks = 0;
    _ticks2 = 0;

    /**
     * @type {HTMLElement|null}
     */
    knob = null;

    /**
     * @type {HTMLElement|null}
     */
    rail = null;

    /**
     * @type {HTMLElement|null}
     */
    defaultMarker = null;

    connectedCallback() {
        const centerCoordinate = this.centerCoordinate;

        const svgTicks = [];
        if (this._ticks) {
            const degreePerTick = 360 / this._ticks;
            const tickLength = this._knobDiameter / 5;
            for (let tick = 0; tick < this._ticks; tick++) {
                svgTicks.push(
                    `<path class="tick" d="M ${centerCoordinate} ${
                        centerCoordinate - this.railRadius - tickLength * 2
                    } v ${-tickLength}" stroke="black" transform="rotate(${
                        tick * degreePerTick
                    } ${centerCoordinate} ${centerCoordinate})"/>`,
                );
            }
        }

        if (this._max2) {
            svgTicks.push(
                `<circle class="tick" cx="${centerCoordinate}" cy="${centerCoordinate}" r="0.5" stroke="black" fill="none"/>`,
            );
        }

        let svg = `<svg width="${this._width}" height="${this._width}" version="1.1" viewBox="0 0 ${this._width} ${
            this._width
        }" xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape">
    <circle class="rail${this._max2 ? " rail--filled" : ""}" cx="${centerCoordinate}" cy="${centerCoordinate}" r="${
        this.railRadius
    }" stroke="black" fill="${this._max2 ? "white" : "none"}" />
    <circle class="default${this._max2 ? " default--filled" : ""}" cx="${centerCoordinate}" cy="${
        centerCoordinate - this.railRadius
    }" r="0.5" stroke="white" fill="none"/>
    <g class="ticks">${svgTicks.join("\n")}</g>
    <circle class="knob" cx="${centerCoordinate}" cy="${centerCoordinate}" r="${this._knobDiameter / 2}" />
</svg>`;

        this.innerHTML = svg;
        this.knob = this.querySelector(".knob");
        this.rail = this.querySelector(".rail");
        this.defaultMarker = this.querySelector(".default");
        this._attachEventListeners();
        this.setKnob();
        this.setDefaultMarker();
    }

    _attachEventListeners() {
        for (const element of this.querySelectorAll(".rail, .click-box, .knob")) {
            element.style.cursor = "pointer";

            for (const eventType of ["mousedown", "touchstart"]) {
                element.addEventListener(eventType, (e) => {
                    this.setValueFromCoordinates(e);
                    this._isChangeMode = true;
                });
            }
        }

        for (const eventType of ["mousemove", "touchmove"]) {
            this.addEventListener(eventType, (e) => {
                if (!this._isChangeMode) {
                    return;
                }
                e.preventDefault();
                this.setValueFromCoordinates(e);
            });
        }

        for (const eventType of ["mouseleave", "mouseup", "touchend"]) {
            this.addEventListener(eventType, (e) => {
                this._isChangeMode = false;
            });
        }

        this.addEventListener("wheel", (e) => {
            e.preventDefault();
            this.value += e.deltaY * 0.0001 * this._max;
            if (this._max2) {
                this.value2 += e.deltaX * 0.001 * this._max2;
            }
        });

        this.addEventListener("dblclick", (e) => {
            e.preventDefault();
            this.reset();
        });
    }

    /**
     *
     * @param {string} name
     * @param {string} oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value":
                this.value = Number(newValue);
                break;
            case "value2":
                this.value2 = Number(newValue);
                break;
            case "default":
                this.default = Number(newValue);
                break;
            case "default2":
                this.default2 = Number(newValue);
                break;
            case "max2":
                this.max2 = Number(newValue);
                break;
            case "max":
                this.max = Number(newValue);
                break;
            case "width":
                this._width = Number(newValue);
                break;
            case "padding":
                this._padding = Number(newValue);
                break;
            case "ticks":
                this.ticks = Number(newValue);
                break;
            case "ticks2":
                this.ticks2 = Number(newValue);
                break;
        }
    }

    set value(value) {
        this._value = Math.round(value + this.max) % this._max;
        this.dispatchEvent(
            new CustomEvent("change", {
                detail: {
                    value: this._value,
                },
            }),
        );
        this.setKnob();
    }

    get value() {
        return this._value;
    }

    set value2(value2) {
        this._value2 = Math.max(0, Math.min(Math.round(value2), this.max2));
        this.dispatchEvent(
            new CustomEvent("change", {
                detail: {
                    value2: this._value2,
                },
            }),
        );
        this.setKnob();
    }

    get value2() {
        return this._value2;
    }

    set max(max) {
        this._max = max;
        this._value %= this._max;
        this.setKnob();
    }

    get max() {
        return this._max;
    }

    set max2(max2) {
        this._max2 = max2;
        this._value2 %= this._max2;
        this.setKnob();
    }

    get max2() {
        return this._max2;
    }

    set ticks(ticks) {
        this._ticks = ticks;
    }

    set ticks2(ticks2) {
        this._ticks2 = ticks2;
    }

    set default(defaultValue) {
        this._default = defaultValue;
        this.setDefaultMarker();
    }

    set default2(default2) {
        this._default2 = default2;
        this.setDefaultMarker();
    }

    /**
     *
     * @param {TouchEvent|MouseEvent} e
     */
    setValueFromCoordinates(e) {
        const clientX = e.touches?.item(0)?.clientX ?? e.clientX;
        const clientY = e.touches?.item(0)?.clientY ?? e.clientY;

        const rect = this.rail?.getBoundingClientRect() ?? this.getBoundingClientRect();
        const x = clientX - rect.x - rect.width / 2;
        const y = -(clientY - rect.y - rect.height / 2);
        const angle = Math.atan2(x, y);
        this.value = (angle / 2 / Math.PI) * this._max;

        if (this._max2) {
            const distance = Math.sqrt(x ** 2 + y ** 2) / (rect.width / 2);
            this.value2 = distance * this._max2;
        }
    }

    reset() {
        this.value = this._default;
        this.value2 = this._default2;
    }

    setKnob() {
        if (!this.knob) {
            return;
        }

        const railRadius = this.railRadius * (this._max2 ? this._value2 / this._max2 : 1);
        const centerCoordinate = this.centerCoordinate;
        const angle = (360 * this._value) / this._max;

        this.knob.setAttribute("cx", centerCoordinate + Math.sin((angle / 180) * Math.PI) * railRadius);
        this.knob.setAttribute("cy", centerCoordinate - Math.cos((angle / 180) * Math.PI) * railRadius);
    }

    setDefaultMarker() {
        if (!this.defaultMarker) {
            return;
        }

        const railRadius = this.railRadius * (this._max2 ? this._default2 / this._max2 : 1);
        const centerCoordinate = this.centerCoordinate;
        const angle = (360 * this._default) / this._max;

        this.defaultMarker.setAttribute("cx", centerCoordinate + Math.sin((angle / 180) * Math.PI) * railRadius);
        this.defaultMarker.setAttribute("cy", centerCoordinate - Math.cos((angle / 180) * Math.PI) * railRadius);
    }

    get centerCoordinate() {
        return this._width / 2;
    }

    get railRadius() {
        return this.centerCoordinate - this._padding - this._knobDiameter / 2;
    }
}
customElements.define("simform-input-round", SimformInputRound);

// -----------------------------------------------------------------------------

export class SimformInputQuad extends SimformInputRound {
    /**
     * @type {HTMLElement|null}
     */
    percentage = null;

    connectedCallback() {
        const realPadding = this.realPadding;
        const outerEdge = this._width - realPadding;

        const pathInstructions = this._max2
            ? `M ${realPadding} ${realPadding} L${realPadding} ${outerEdge} L${outerEdge} ${outerEdge}`
            : `M ${realPadding} ${outerEdge} L${outerEdge} ${outerEdge}`;
        const svgTicks = [];
        const clickBox = this._max2
            ? `<rect x="${realPadding}" y="${realPadding}" width="${outerEdge - realPadding}" height="${
                  outerEdge - realPadding
              }" fill="transparent" stroke="none" class="rail rail--filled" />`
            : "";

        if (this._ticks) {
            const tickDistance = (this._width - realPadding * 2) / this._ticks;
            const tickLength = this._knobDiameter / 5;
            for (let tick = 0; tick <= this._ticks; tick++) {
                const x = outerEdge - tickDistance * tick;
                svgTicks.push(
                    `<path class="tick" d="M ${x} ${this._width - this._padding} v ${-tickLength}" stroke="black" />`,
                );
            }
        }

        if (this._max2 && this._ticks2) {
            const tickDistance = (this._width - realPadding * 2) / this._ticks2;
            const tickLength = this._knobDiameter / 5;
            for (let tick = 0; tick <= this._ticks2; tick++) {
                const x = outerEdge - tickDistance * tick;
                svgTicks.push(`<path class="tick" d="M ${this._padding} ${x}  h ${-tickLength}" stroke="black" />`);
            }
        }

        let svg = `<svg width="${this._width}" height="${this._width}" version="1.1" viewBox="0 0 ${this._width} ${
            this._width
        }" xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape">
    <line x1="${
        realPadding + 3
    }" y1="${outerEdge}" x2="${realPadding}" y2="${outerEdge}" stroke="black" fill="none" class="percentage" style="--opacity:0" />
    <path class="rail" d="${pathInstructions}" stroke="black" fill="none" />
    ${clickBox}
    <g class="ticks">${svgTicks.join("\n")}</g>
    <circle class="knob" cx="${realPadding}" cy="${realPadding}" r="${this._knobDiameter / 2}" />
</svg>`;

        this.innerHTML = svg;
        this.knob = this.querySelector(".knob");
        this.rail = this.querySelector(".rail");
        this.percentage = this.querySelector(".percentage");
        this._attachEventListeners();
        this.setKnob();
    }

    set value(value) {
        this._value = Math.min(Math.max(Math.round(value), 0), this.max);
        this.dispatchEvent(
            new CustomEvent("change", {
                detail: {
                    value: this._value,
                },
            }),
        );
        this.setKnob();
    }

    get value() {
        return this._value;
    }

    /**
     *
     * @param {TouchEvent|MouseEvent} e
     */
    setValueFromCoordinates(e) {
        const clientX = e.touches?.item(0)?.clientX ?? e.clientX;
        const clientY = e.touches?.item(0)?.clientY ?? e.clientY;

        const rect = this.rail?.getBoundingClientRect() ?? this.getBoundingClientRect();
        const x = clientX - rect.x;
        const y = clientY - rect.y;

        this.value = (x / rect.width) * this.max;
        if (this._max2) {
            this.value2 = (1 - y / rect.height) * this.max2;
        }
    }

    setKnob() {
        if (!this.knob) {
            return;
        }

        const realPadding = this.realPadding;
        const range = this._width - realPadding * 2;

        this.knob.setAttribute("cx", realPadding + (this._value / this._max) * range);

        const percentage = (this._value ?? 0) / (this._max ?? 1);
        const percentage2 = (this._value2 ?? 0) / (this._max2 ?? 1);
        this.knob.setAttribute("cy", this._width - realPadding - percentage2 * range);

        const y = this._width - realPadding - percentage2 * range;
        this.percentage?.setAttribute("y1", y);
        this.percentage?.setAttribute("x2", realPadding + (this._value / this._max) * range);
        this.percentage?.setAttribute("y2", y);
        this.percentage?.setAttribute("style", `--opacity:${percentage}`);
    }

    get realPadding() {
        return this._padding + this._knobDiameter / 2;
    }
}
customElements.define("simform-input-quad", SimformInputQuad);

// -----------------------------------------------------------------------------

export class SimformOutputDatetime extends HTMLElement {
    static observedAttributes = ["value-hour", "value-dayofyear", "offset", "no-year"];

    _output;
    _output2;
    _offset = 0;
    _noYear = false;
    date = new Date();

    connectedCallback() {
        this.innerHTML = `
      It is <output id="utc"></output> in Coordinated Universal Time (UTC),
      <br />or <output id="local"></output> in Nautical Time at your current position.
    `;
        this._output = this.querySelector("#utc");
        this._output2 = this.querySelector("#local");
        this.style.display = "block";

        this._update();
    }

    /**
     *
     * @param {string} name
     * @param {string} oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value-hour":
                this.hours = Number(newValue);
                break;
            case "value-dayofyear":
                this.doy = Number(newValue);
                break;
            case "offset":
                this._offset = Number(newValue);
                this._update();
                break;
            case "no-year":
                this._noYear = newValue !== null && newValue !== "false";
                this._update();
                break;
        }
    }

    set hours(valueHour) {
        this.date.setUTCHours(Math.floor(valueHour / 60), valueHour % 60, 0, 0);
        this._update();
    }

    set doy(valueDayOfYear) {
        const now = new Date();
        this.date.setUTCFullYear(now.getUTCFullYear(), 0, valueDayOfYear + 1);
        this._update();
    }

    set offset(offset) {
        this._offset = offset;
        this._update;
    }

    _getFormattedDate(date, offset = null) {
        return (
            date.toLocaleDateString("en-US", {
                weekday: this._noYear ? undefined : "long",
                year: this._noYear ? undefined : "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
            }) +
            ", " +
            date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "UTC",
            }) +
            (offset !== null ? ` (UTC${offset >= 0 ? "+" : ""}${offset})` : "")
        );
    }

    _update() {
        const now = new Date();

        if (this.date > now) {
            this.date.setUTCFullYear(now.getUTCFullYear() - 1);
        }

        if (!this._output || !this._output2) {
            return;
        }

        this._output.value = this._getFormattedDate(this.date);

        const copiedDate = new Date(this.date.getTime());
        copiedDate.setUTCHours(copiedDate.getUTCHours() + this._offset);

        this._output2.value = this._getFormattedDate(copiedDate, this._offset);
    }
}
customElements.define("simform-output-datetime", SimformOutputDatetime);

// -----------------------------------------------------------------------------
