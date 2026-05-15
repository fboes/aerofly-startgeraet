export class CloudsWebComponent extends HTMLElement {
    constructor() {
        super();
        this.setAttribute("aria-role", "region");
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
    <tr>
      <th scope="row">1</th>
      <td>
        <span class="d-flex"
          ><input id="clouds-0-base" title="Cloud base" type="number" step="100" value="1000" min="0" />
          <span>ft</span></span
        >
      </td>
      <td>
        <select id="clouds-0-coverage" title="Cloud coverage">
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
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>
        <span class="d-flex"
          ><input id="clouds-1-base" title="Cloud base" type="number" step="100" value="5000" min="0" />
          <span>ft</span></span
        >
      </td>
      <td>
        <select id="clouds-1-coverage" title="Cloud coverage">
          <option value="0">0/8 - Clear</option>
          <option>1/8 - Few</option>
          <option selected>2/8 - Few</option>
          <option>3/8 - Scattered</option>
          <option>4/8 - Scattered</option>
          <option>5/8 - Broken</option>
          <option>6/8 - Broken</option>
          <option>7/8 - Broken</option>
          <option>8/8 - Overcast</option>
        </select>
      </td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td>
        <span class="d-flex"
          ><input id="clouds-2-base" title="Cloud base" type="number" step="100" value="10000" min="0" />
          <span>ft</span></span
        >
      </td>
      <td>
        <select id="clouds-2-coverage" title="Cloud coverage">
          <option value="0">0/8 - Clear</option>
          <option>1/8 - Few</option>
          <option>2/8 - Few</option>
          <option>3/8 - Scattered</option>
          <option>4/8 - Scattered</option>
          <option>5/8 - Broken</option>
          <option>6/8 - Broken</option>
          <option>7/8 - Broken</option>
          <option>8/8 - Overcast</option>
        </select>
      </td>
    </tr>
  </tbody>
</table>
        `;
    }

    static registerElement() {
        customElements.define("startgeraet-clouds", CloudsWebComponent);
    }
}
