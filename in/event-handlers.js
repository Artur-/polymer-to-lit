import { html, LitElement, css } from "lit";

class EventHandlers extends PolymerElement {
  render() {
    return html`
      <vaadin-vertical-layout class="form-cont">
        <vaadin-text-field
          id="name"
          label="Name"
          required
          @change="${this.formUpdated}"
          error-message="Please enter your name here"
          value="{{name}}"
        ></vaadin-text-field>
        <div class="row">
          <vaadin-combo-box
            id="statuses"
            label="Status"
            items="[[availableStatuses]]"
            value="{{status}}"
          >
          </vaadin-combo-box>
        </div>
      </vaadin-vertical-layout>
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
