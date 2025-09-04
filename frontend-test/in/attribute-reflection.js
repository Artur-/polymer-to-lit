import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class AttributeReflection extends PolymerElement {
  static get is() { return 'attribute-reflection'; }
  
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          padding: 20px;
        }
        :host([disabled]) {
          opacity: 0.5;
          pointer-events: none;
        }
        :host([theme="dark"]) {
          background: #333;
          color: white;
        }
        :host([theme="light"]) {
          background: #fff;
          color: black;
        }
      </style>
      
      <div>
        <h3>Attribute Reflection Test</h3>
        
        <div>Theme: [[theme]]</div>
        <div>Disabled: [[disabled]]</div>
        <div>Hidden: [[hidden]]</div>
        <div>TabIndex: [[tabIndex]]</div>
        <div>Role: [[role]]</div>
        <div>Data Value: [[dataValue]]</div>
        
        <div>
          <button on-click="toggleTheme">Toggle Theme</button>
          <button on-click="toggleDisabled">Toggle Disabled</button>
          <button on-click="incrementTabIndex">Increment TabIndex</button>
        </div>
        
        <div>
          <input type="checkbox" checked="{{checked::change}}">
          <span>Checked: [[checked]]</span>
        </div>
        
        <div>
          <input value="{{inputValue::input}}" 
                 disabled$="[[disabled]]"
                 placeholder$="[[placeholder]]">
        </div>
        
        <a href$="[[computeHref(linkPath)]]" 
           target$="[[linkTarget]]"
           hidden$="[[!showLink]]">
          [[linkText]]
        </a>
      </div>
    `;
  }
  
  static get properties() {
    return {
      theme: {
        type: String,
        value: 'light',
        reflectToAttribute: true
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      tabIndex: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      },
      role: {
        type: String,
        value: 'button',
        reflectToAttribute: true
      },
      dataValue: {
        type: String,
        value: 'custom-data',
        reflectToAttribute: true,
        attribute: 'data-value'
      },
      checked: {
        type: Boolean,
        value: false,
        notify: true
      },
      inputValue: {
        type: String,
        value: ''
      },
      placeholder: {
        type: String,
        value: 'Enter text...'
      },
      linkPath: {
        type: String,
        value: '/home'
      },
      linkTarget: {
        type: String,
        value: '_blank'
      },
      linkText: {
        type: String,
        value: 'Click here'
      },
      showLink: {
        type: Boolean,
        value: true
      }
    };
  }
  
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }
  
  toggleDisabled() {
    this.disabled = !this.disabled;
  }
  
  incrementTabIndex() {
    this.tabIndex++;
  }
  
  computeHref(path) {
    return `https://example.com${path}`;
  }
}

customElements.define(AttributeReflection.is, AttributeReflection);