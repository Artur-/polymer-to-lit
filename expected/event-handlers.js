import { html, LitElement, css } from "lit";

class EventHandlers extends LitElement {
  render() {
    return html`
        <vaadin-vertical-layout class="form-cont">
          <vaadin-text-field
            id="name"
            label="Name"
            required
            @change="${this.formUpdated}"
            error-message="Please enter your name here"
            value="${this.name}"
            @value-changed="${(e) => this.name=e.target.value}"
          ></vaadin-text-field>
        </vaadin-vertical-layout>
        <vaadin-vertical-layout id="buttons">
          <vaadin-button
            id="signUp"
            theme="primary"
             @click="${this.submit}"
            >Sign Up</vaadin-button
          >
          <vaadin-button id="cancelSignUpBtn" theme="tertiary" on-click="cancelButtonClicked"
            >Cancel</vaadin-button
          >
          
        </vaadin-vertical-layout>

        <span class="payment-notes">Month-to-month @ $500 / month</span>
      </vaadin-vertical-layout>

      </vaadin-vertical-layout>
      <a class="support" href="{{contactLink}}">Contact Support</a>
    </div>
`;
  }

  static get is() {
    return "event-handlers";
  }

  // submit is called when the user clicks the submit button. They are only able to do that once all the data has been
  // validated by us and by Stripe (Stripe naturally only validates the credit card information on their side)
  submit() {
    console.log("Submit clicked");
  }

  formUpdated() {
    console.log("Form updated");
  }
}

customElements.define(EventHandlers.is, EventHandlers);
