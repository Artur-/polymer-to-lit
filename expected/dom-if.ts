import { html, LitElement, css } from "lit";
import "@vaadin/vaadin-vertical-layout";

class DomIfTest extends LitElement {
  render() {
    return html`
      <vaadin-vertical-layout>
        ${this.showDetails
          ? html`
              <span>Here are some details you asked for</span>
              <span>Here are more details you asked for</span>
            `
          : html``}
        ${this.showDetails
          ? html`
              <span>Here some more details</span>
              <span>Here even more details</span>
            `
          : html``}
      </vaadin-vertical-layout>
    `;
  }

  static get is() {
    return "dom-if-test";
  }
}

customElements.define(DomIfTest.is, DomIfTest);
