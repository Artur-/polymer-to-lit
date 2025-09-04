import { html, LitElement, css } from "lit";

class SlotsTest extends LitElement {
  static get is() {
    return "slots-test";
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;
          border: 2px solid blue;
          padding: 20px;
        }
        .header {
          background: #f0f0f0;
          padding: 10px;
        }
        .content {
          padding: 10px;
        }
        .footer {
          background: #e0e0e0;
          padding: 10px;
        }
      `,
    ];
  }
  render() {
    return html`
      <div class="header">
        <h3>${this.title}</h3>
        <slot name="header">Default Header Content</slot>
      </div>

      <div class="content">
        <slot>Default Content</slot>

        ${this.showExtra ? html` <slot name="extra"></slot> ` : html``}
      </div>

      <div class="footer">
        <slot name="footer">
          <span>Default Footer - ${this.footerText}</span>
        </slot>
      </div>

      <div>
        <button @click="${this.toggleExtra}">Toggle Extra Slot</button>
      </div>
    `;
  }

  static get properties() {
    return {
      title: {
        type: String,
      },
      footerText: {
        type: String,
      },
      showExtra: {
        type: Boolean,
      },
    };
  }

  toggleExtra() {
    this.showExtra = !this.showExtra;
  }
  constructor() {
    super();
    this.title = "Component with Slots";
    this.footerText = "No custom footer provided";
    this.showExtra = false;
  }
}

customElements.define(SlotsTest.is, SlotsTest);
