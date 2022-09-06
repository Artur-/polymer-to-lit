import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";

class BasicBindings extends PolymerElement {
  static get template() {
    return html`
      <vaadin-vertical-layout id="buttons">
        <vaadin-button id="[[buttonId]]">[[buttonText]]</vaadin-button>
        <vaadin-text-field value="[[textfieldValue]]"></vaadin-text-field>
      </vaadin-vertical-layout>
    `;
  }

  static get is() {
    return "basic-bindings";
  }
}

customElements.define(BasicBindings.is, BasicBindings);
