import { html, LitElement, css } from "lit";


class NotifyEdgeCases extends LitElement {
  static get is() { return 'notify-edge-cases'; }
  
  render() {
        return html`
      <div>
        <h3>Notify and Two-Way Binding Edge Cases</h3>
        
        <!-- Standard two-way binding -->
        <div>
          <input .value="${standardValue::input}" @value-changed="${(e) => (standardValue::input = e.target.value)}">
          <span>Standard: ${this.standardValue}</span>
        </div>
        
        <!-- With custom event -->
        <div>
          <input .value="${customEventValue::blur}" @value-changed="${(e) => (customEventValue::blur = e.target.value)}">
          <span>On Blur: ${this.customEventValue}</span>
        </div>
        
        <!-- Checkbox binding -->
        <div>
          <input type="checkbox" .checked="${isChecked::change}" @checked-changed="${(e) => (isChecked::change = e.target.value)}">
          <span>Checked: ${this.isChecked}</span>
        </div>
        
        <!-- Select binding -->
        <div>
          <select .value="${selectedOption::change}" @value-changed="${(e) => (selectedOption::change = e.target.value)}">
            <option value="opt1">Option 1</option>
            <option value="opt2">Option 2</option>
            <option value="opt3">Option 3</option>
          </select>
          <span>Selected: ${this.selectedOption}</span>
        </div>
        
        <!-- Nested property binding -->
        <div>
          <input .value="${user.name::input}" @value-changed="${(e) => (user.name::input = e.target.value)}">
          <span>User name: ${(this.user) ? this.user.name : undefined}</span>
        </div>
        
        <!-- Array item binding in dom-repeat -->
        ${((this.items) ? this.items : []).map((item, index) => html`
          <div>
            <input .value="${item.value::input}" @value-changed="${(e) => (item.value::input = e.target.value)}">
            <span>Item ${index}: ${item.value}</span>
          </div>
        `)}
        
        <!-- Computed binding with notify -->
        <div>
          <span>Computed (should update): ${this.computedFromNotify}</span>
        </div>
        
        <!-- Property with notify: true -->
        <div>
          <button @click="${this.updateNotifyProperty}">Update Notify Property</button>
          <span>Notify Property: ${this.notifyProperty}</span>
        </div>
      </div>
    `;
              }
  
  static get properties() {
    return {
      standardValue: {
        type: String,
        
        notify: true
      },
      customEventValue: {
        type: String,
        
        notify: true
      },
      isChecked: {
        type: Boolean,
        
        notify: true
      },
      selectedOption: {
        type: String,
        
        notify: true
      },
      user: {
        type: Object,
        
        notify: true
      },
      items: {
        type: Array,
        
        notify: true
      },
      notifyProperty: {
        type: String,
        
        notify: true
      },
      computedFromNotify: {
        type: String,
        
      }
    };
  }
  
  _computeFromNotify(standard, notify) {
    return `${standard} + ${notify}`;
  }
  
  updateNotifyProperty() {
    this.notifyProperty = `Updated ${Date.now()}`;
    // Should fire notify-property-changed event
    this.dispatchEvent(new CustomEvent('notify-property-changed', {
      detail: { value: this.notifyProperty }
    }));
  }
get computedFromNotify() {
        return (this._computeFromNotify)(this.standardValue, this.notifyProperty);
      }constructor() {
          super();
          this.standardValue = 'initial';
this.customEventValue = '';
this.isChecked = false;
this.selectedOption = 'opt1';
this.notifyProperty = 'Initial';
        }}

customElements.define(NotifyEdgeCases.is, NotifyEdgeCases);