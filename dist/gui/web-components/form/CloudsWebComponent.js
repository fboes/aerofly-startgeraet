export class CloudsWebComponent extends HTMLElement {
    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        const cloudInputs = [0, 1, 2].map((i) => {
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
    }
    static registerElement() {
        customElements.define("startgeraet-clouds", CloudsWebComponent);
    }
}
