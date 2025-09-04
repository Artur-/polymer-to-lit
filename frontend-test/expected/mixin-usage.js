import { html, LitElement, css } from "lit";

// Define a simple mixin
const MyMixin = (superClass) =>
  class extends superClass {
    static get properties() {
      return {
        mixinProperty: {
          type: String,
          value: "From Mixin",
        },
      };
    }

    mixinMethod() {
      return "Mixin method called";
    }
  };

// Another mixin
const LoggerMixin = (superClass) =>
  class extends superClass {
    connectedCallback() {
      super.connectedCallback();
      console.log("Component connected:", this.tagName);
    }

    log(message) {
      console.log(`[${this.tagName}] ${message}`);
    }
  };

// Component using multiple mixins
class MixinUsage extends LoggerMixin(MyMixin(LitElement)) {
  static get is() {
    return "mixin-usage";
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;
          padding: 20px;
        }
      `,
    ];
  }
  render() {
    return html`
      <div>
        <h3>Mixin Usage Test</h3>
        <div>Mixin Property: ${this.mixinProperty}</div>
        <div>Component Property: ${this.componentProperty}</div>
        <div>Method Result: ${this.methodResult}</div>
        <button @click="${this.callMixinMethod}">Call Mixin Method</button>
        <button @click="${this.logMessage}">Log Message</button>
      </div>
    `;
  }

  static get properties() {
    return {
      componentProperty: {
        type: String,
      },
      methodResult: {
        type: String,
      },
    };
  }

  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    this.log("Component is ready");
  }

  callMixinMethod() {
    this.methodResult = this.mixinMethod();
    this.log("Mixin method was called");
  }

  logMessage() {
    this.log("Custom message from component");
  }
  constructor() {
    super();
    this.componentProperty = "From Component";
    this.methodResult = "";
  }
}

customElements.define(MixinUsage.is, MixinUsage);
