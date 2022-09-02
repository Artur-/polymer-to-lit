import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";

class PropertiesDefined extends PolymerElement {
  static get template() {
    return html`
      <div>
        <span>somethingWithValue.value: [[somethingWithValue.value]]</span>

        <span>errorMessage: [[errorMessage]]</span>

        <span>booleanDefaultFalse: [[booleanDefaultFalse]]</span>

        <span>booleanDefaultTrue: [[booleanDefaultTrue]]</span>

        <span>stringWithoutDefault: [[stringWithoutDefault]]</span>

        <span>stringFoo: [[stringFoo]]</span>
      </div>
    `;
  }

  static get is() {
    return "properties-defined";
  }

  static get properties() {
    return {
      somethingWithValue: Object,
      errorMessage: String,
      booleanDefaultFalse: {
        type: Boolean,
        value: false,
      },
      booleanDefaultTrue: {
        type: Boolean,
        value: true,
      },
      stringWithoutDefault: {
        type: String,
      },
      stringFoo: {
        type: String,
        value: "Foo",
      },
    };
  }
}

customElements.define(PropertiesDefined.is, PropertiesDefined);
