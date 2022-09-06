import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@vaadin/vaadin-vertical-layout";

class DomIfTest extends PolymerElement {
  static get template() {
    return html`
      <vaadin-vertical-layout>
        <template is="dom-if" if="{{showDetails}}">
          <span>Here are some details you asked for</span>
          <span>Here are more details you asked for</span>
        </template>
        <dom-if if="{{showDetails}}">
          <template>
            <span>Here some more details</span>
            <span>Here even more details</span>
          </template>
        </dom-if>
      </vaadin-vertical-layout>
    `;
  }

  static get is() {
    return "dom-if-test";
  }
}

customElements.define(DomIfTest.is, DomIfTest);
