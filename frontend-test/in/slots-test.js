import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class SlotsTest extends PolymerElement {
  static get is() { return 'slots-test'; }
  
  static get template() {
    return html`
      <style>
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
      </style>
      
      <div class="header">
        <h3>[[title]]</h3>
        <slot name="header">Default Header Content</slot>
      </div>
      
      <div class="content">
        <slot>Default Content</slot>
        
        <template is="dom-if" if="[[showExtra]]">
          <slot name="extra"></slot>
        </template>
      </div>
      
      <div class="footer">
        <slot name="footer">
          <span>Default Footer - [[footerText]]</span>
        </slot>
      </div>
      
      <div>
        <button on-click="toggleExtra">Toggle Extra Slot</button>
      </div>
    `;
  }
  
  static get properties() {
    return {
      title: {
        type: String,
        value: 'Component with Slots'
      },
      footerText: {
        type: String,
        value: 'No custom footer provided'
      },
      showExtra: {
        type: Boolean,
        value: false
      }
    };
  }
  
  toggleExtra() {
    this.showExtra = !this.showExtra;
  }
}

customElements.define(SlotsTest.is, SlotsTest);