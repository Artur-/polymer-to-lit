import { html, LitElement, css } from "lit";

// Test case 1: export class pattern
export class TestExportClass extends LitElement {
  static get is() {
    return "test-export-class";
  }
  render() {
    return html`<div>${this.exportTest}</div>`;
  }
  static get properties() {
    return {
      exportTest: { type: String },
    };
  }
  constructor() {
    super();
    this.exportTest = "Export Class Works";
  }
}

// Test case 2: class with separate export
class TestNamedExport extends LitElement {
  static get is() {
    return "test-named-export";
  }
  render() {
    return html`<div>${this.namedTest}</div>`;
  }
  static get properties() {
    return {
      namedTest: { type: String },
    };
  }
  constructor() {
    super();
    this.namedTest = "Named Export Works";
  }
}

// Test case 3: export default class pattern
export default class TestDefaultClass extends LitElement {
  static get is() {
    return "test-default-class";
  }
  render() {
    return html`<div>${this.defaultTest}</div>`;
  }
  static get properties() {
    return {
      defaultTest: { type: String },
    };
  }
  constructor() {
    super();
    this.defaultTest = "Default Export Works";
  }
}

// Named export at the end
export { TestNamedExport };

// Export with rename
export { TestNamedExport as RenamedExport };

customElements.define(TestExportClass.is, TestExportClass);
customElements.define(TestNamedExport.is, TestNamedExport);
customElements.define(TestDefaultClass.is, TestDefaultClass);
