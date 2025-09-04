import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

// Define a simple mixin
const MyMixin = (superClass) => class extends superClass {
  static get properties() {
    return {
      mixinProperty: {
        type: String,
        value: 'From Mixin'
      }
    };
  }
  
  mixinMethod() {
    return 'Mixin method called';
  }
};

// Another mixin
const LoggerMixin = (superClass) => class extends superClass {
  connectedCallback() {
    super.connectedCallback();
    console.log('Component connected:', this.tagName);
  }
  
  log(message) {
    console.log(`[${this.tagName}] ${message}`);
  }
};

// Component using multiple mixins
class MixinUsage extends LoggerMixin(MyMixin(PolymerElement)) {
  static get is() { return 'mixin-usage'; }
  
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          padding: 20px;
        }
      </style>
      
      <div>
        <h3>Mixin Usage Test</h3>
        <div>Mixin Property: [[mixinProperty]]</div>
        <div>Component Property: [[componentProperty]]</div>
        <div>Method Result: [[methodResult]]</div>
        <button on-click="callMixinMethod">Call Mixin Method</button>
        <button on-click="logMessage">Log Message</button>
      </div>
    `;
  }
  
  static get properties() {
    return {
      componentProperty: {
        type: String,
        value: 'From Component'
      },
      methodResult: {
        type: String,
        value: ''
      }
    };
  }
  
  ready() {
    super.ready();
    this.log('Component is ready');
  }
  
  callMixinMethod() {
    this.methodResult = this.mixinMethod();
    this.log('Mixin method was called');
  }
  
  logMessage() {
    this.log('Custom message from component');
  }
}

customElements.define(MixinUsage.is, MixinUsage);