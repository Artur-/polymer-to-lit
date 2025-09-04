import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

// Test case 1: export class pattern
export class TestExportClass extends PolymerElement {
  static get is() { return 'test-export-class'; }
  static get template() {
    return html`<div>[[exportTest]]</div>`;
  }
  static get properties() {
    return {
      exportTest: { type: String, value: 'Export Class Works' }
    };
  }
}

// Test case 2: class with separate export
class TestNamedExport extends PolymerElement {
  static get is() { return 'test-named-export'; }
  static get template() {
    return html`<div>[[namedTest]]</div>`;
  }
  static get properties() {
    return {
      namedTest: { type: String, value: 'Named Export Works' }
    };
  }
}

// Test case 3: export default class pattern
export default class TestDefaultClass extends PolymerElement {
  static get is() { return 'test-default-class'; }
  static get template() {
    return html`<div>[[defaultTest]]</div>`;
  }
  static get properties() {
    return {
      defaultTest: { type: String, value: 'Default Export Works' }
    };
  }
}

// Named export at the end
export { TestNamedExport };

// Export with rename
export { TestNamedExport as RenamedExport };

customElements.define(TestExportClass.is, TestExportClass);
customElements.define(TestNamedExport.is, TestNamedExport);
customElements.define(TestDefaultClass.is, TestDefaultClass);