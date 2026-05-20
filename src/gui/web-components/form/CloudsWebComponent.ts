import { sendToMain } from "../../renderer/sendToMain.js";

export type CloudsWebComponentState = {
    clouds: {
        baseFt: number;
        coverageEighths: number;
    }[];
};

export class CloudsWebComponent extends HTMLElement {
    elements: {
        base: HTMLInputElement;
        coverage: HTMLSelectElement;
    }[];

    constructor() {
        super();
        this.setAttribute("aria-role", "region");

        const cloudInputs: string[] = [0, 1, 2].map((i) => {
            return `\
<tr>
    <th scope="row">${i + 1}</th>
    <td>
        <span class="d-flex">
            <input id="clouds-${i}-base" title="Cloud base" type="number" step="100" value="${[1000, 5000, 10000][i]}" min="0" />
            <span>ft</span>
        </span
    </td>
    <td>
        <select id="clouds-${i}-coverage" title="Cloud coverage">
            <option value="0">0/8 - Clear</option>
            <option>1/8 - Few</option>
            <option>2/8 - Few</option>
            <option selected>3/8 - Scattered</option>
            <option>4/8 - Scattered</option>
            <option>5/8 - Broken</option>
            <option>6/8 - Broken</option>
            <option>7/8 - Broken</option>
            <option>8/8 - Overcast</option>
        </select>
    </td>
</tr>`;
        });

        this.innerHTML = `\
<h3>☁️ Clouds</h3>
<table>
    <thead>
        <tr>
            <th>#</th>
            <th>Base</th>
            <th>Cover</th>
        </tr>
    </thead>
    <tbody>
        ${cloudInputs.join("")}
    </tbody>
</table>
`;

        this.elements = [...this.querySelectorAll("tbody tr")].map((row) => ({
            base: row.querySelector(`input`) as HTMLInputElement,
            coverage: row.querySelector(`select`) as HTMLSelectElement,
        }));
    }

    get state(): CloudsWebComponentState {
        return {
            clouds: this.elements.map((element) => ({
                baseFt: element.base.valueAsNumber,
                coverageEighths: element.coverage.selectedIndex,
            })),
        };
    }

    connectedCallback() {
        window.electronAPI.onStateUpdate((state) => {
            this.elements.forEach((element, i) => {
                const cloud = state.clouds[i];
                if (cloud) {
                    element.base.valueAsNumber = Math.round(cloud.height_ft / 100) * 100; // round to nearest 100 ft
                    element.coverage.selectedIndex = Math.round(cloud.density * 8); // 0-1 mapped to 0-8 oktas
                } else {
                    element.base.valueAsNumber = 0;
                    element.coverage.selectedIndex = 0;
                }
            });
        });

        this.addEventListener("input", () => this.handleChange());
    }

    handleChange() {
        sendToMain<CloudsWebComponentState>("clouds:set", this.state);
    }

    static registerElement() {
        customElements.define("startgeraet-clouds", CloudsWebComponent);
    }
}
