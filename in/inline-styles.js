import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@vaadin/vaadin-ordered-layout/src/vaadin-horizontal-layout.js";

class InlineStyles extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles something-else">
        :host {
          display: block;
          height: 100%;
        }

        .content {
          max-width: 100%;
          padding: var(--lumo-space-xl) 0;
        }

        .title {
          font-weight: 700;
        }
      </style>
      <div class="content">
        <vaadin-horizontal-layout class="cards-holder">
          <vaadin-vertical-layout class="inner-content">
            <vaadin-vertical-layout class="card-header">
              <span class="title">Trial</span>
              <span class="details">30 Days Trial</span>
            </vaadin-vertical-layout>
          </vaadin-vertical-layout>
        </vaadin-horizontal-layout>
      </div>
    `;
  }

  static get is() {
    return "inline-styles";
  }

  static get properties() {
    return {
      // Declare your properties here.
    };
  }
}

customElements.define(InlineStyles.is, InlineStyles);
