import { html, LitElement, css } from "lit";


class AttributeReflection extends LitElement {
  static get is() { return 'attribute-reflection'; }
  
    static get styles() {
        
        
        return [
          
        css`
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
      `
        ];
      }render() {
        return html`
      
      
      <div>
        <h3>Attribute Reflection Test</h3>
        
        <div>Theme: ${this.theme}</div>
        <div>Disabled: ${this.disabled}</div>
        <div>Hidden: ${this.hidden}</div>
        <div>TabIndex: ${this.tabIndex}</div>
        <div>Role: ${this.role}</div>
        <div>Data Value: ${this.dataValue}</div>
        
        <div>
          <button @click="${this.toggleTheme}">Toggle Theme</button>
          <button @click="${this.toggleDisabled}">Toggle Disabled</button>
          <button @click="${this.incrementTabIndex}">Increment TabIndex</button>
        </div>
        
        <div>
          <input type="checkbox" .checked="${checked::change}" @checked-changed="${(e) => (checked::change = e.target.value)}">
          <span>Checked: ${this.checked}</span>
        </div>
        
        <div>
          <input .value="${inputValue::input}" @value-changed="${(e) => (inputValue::input = e.target.value)}" disabled="${this.disabled}" placeholder="${this.placeholder}">
        </div>
        
        <a href="${(this.computeHref)(this.linkPath)}" target="${this.linkTarget}" ?hidden="${!(this.showLink)}">
          ${this.linkText}
        </a>
      </div>
    `;
              }
  
  static get properties() {
    return {
      theme: {
        type: String,
        
        reflect: true,
      },
      disabled: {
        type: Boolean,
        
        reflect: true,
      },
      hidden: {
        type: Boolean,
        
        reflect: true,
      },
      tabIndex: {
        type: Number,
        
        reflect: true,
      },
      role: {
        type: String,
        
        reflect: true,
      },
      dataValue: {
        type: String,
        
        reflect: true,
        attribute: 'data-value'
      },
      checked: {
        type: Boolean,
        
        notify: true
      },
      inputValue: {
        type: String,
        
      },
      placeholder: {
        type: String,
        
      },
      linkPath: {
        type: String,
        
      },
      linkTarget: {
        type: String,
        
      },
      linkText: {
        type: String,
        
      },
      showLink: {
        type: Boolean,
        
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
constructor() {
          super();
          this.theme = 'light';
this.disabled = false;
this.hidden = false;
this.tabIndex = 0;
this.role = 'button';
this.dataValue = 'custom-data';
this.checked = false;
this.inputValue = '';
this.placeholder = 'Enter text...';
this.linkPath = '/home';
this.linkTarget = '_blank';
this.linkText = 'Click here';
this.showLink = true;
        }}

customElements.define(AttributeReflection.is, AttributeReflection);