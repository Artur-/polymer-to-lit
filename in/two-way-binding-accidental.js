import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@vaadin/vaadin-tabs/src/vaadin-tabs.js";
import "@vaadin/vaadin-tabs/src/vaadin-tab.js";
import "@vaadin/vaadin-ordered-layout/src/vaadin-horizontal-layout.js";
import "@vaadin/vaadin-button/src/vaadin-button.js";
import "@vaadin/vaadin-ordered-layout/src/vaadin-vertical-layout.js";

class TwoWayBindingAccidental extends PolymerElement {
  static get template() {
    return html`
      <div class="content">
        <vaadin-vertical-layout style="width: 100%;" class="inner-content">
          <vaadin-horizontal-layout style="width: 100%;" class="block">
            <vaadin-vertical-layout class="info">
              <div class="title">User Email</div>
              <div class="data">Email: {{email}}</div>
              <div class="title">First Name</div>
              <div class="data">{{firstName}}</div>
              <div class="title">Last Name</div>
              <div class="data">{{lastName}}</div>
            </vaadin-vertical-layout>
            <vaadin-button id="editInfoBtn"> Edit </vaadin-button>
          </vaadin-horizontal-layout>
        </vaadin-vertical-layout>
      </div>
    `;
  }

  static get is() {
    return "two-way-binding-accidental";
  }

  static get properties() {
    return {
      // Declare your properties here.
    };
  }
}

customElements.define(TwoWayBindingAccidental.is, TwoWayBindingAccidental);
