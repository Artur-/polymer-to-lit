import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";

class DisabledUsingMethod extends PolymerElement {
  render() {
    return html`
        <vaadin-vertical-layout id="buttons">
          <vaadin-button
            id="signUp"
            theme="primary"
            disabled="${!this.and(this.property1, this.property2)}"
             on-click="submit"
            >Sign Up</vaadin-button
          >
          <vaadin-button id="cancelSignUpBtn" theme="tertiary" @click="${(e:any) => this.cancelButtonClicked(e)}"
            >Cancel</vaadin-button
          >
          
        </vaadin-vertical-layout>

        <span class="payment-notes">Month-to-month @ $500 / month</span>
      </vaadin-vertical-layout>

      </vaadin-vertical-layout>
      <a class="support" .href="${this.contactLink}">Contact Support</a>
    </div>
`;
  }

  and(a, b) {
    return a && b;
  }

  static get is() {
    return "disabled-using-method";
  }

  constructor() {
    super();
    this.property1 = false;
    this.property2 = true;
  }

  static get properties() {
    return {
      property1: {
        type: Boolean,
      },
      property2: {
        type: Boolean,
      },
    };
  }
}

customElements.define(DisabledUsingMethod.is, DisabledUsingMethod);
