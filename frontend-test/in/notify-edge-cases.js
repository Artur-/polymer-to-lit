import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class NotifyEdgeCases extends PolymerElement {
  static get is() { return 'notify-edge-cases'; }
  
  static get template() {
    return html`
      <div>
        <h3>Notify and Two-Way Binding Edge Cases</h3>
        
        <!-- Standard two-way binding -->
        <div>
          <input value="{{standardValue::input}}">
          <span>Standard: [[standardValue]]</span>
        </div>
        
        <!-- With custom event -->
        <div>
          <input value="{{customEventValue::blur}}">
          <span>On Blur: [[customEventValue]]</span>
        </div>
        
        <!-- Checkbox binding -->
        <div>
          <input type="checkbox" checked="{{isChecked::change}}">
          <span>Checked: [[isChecked]]</span>
        </div>
        
        <!-- Select binding -->
        <div>
          <select value="{{selectedOption::change}}">
            <option value="opt1">Option 1</option>
            <option value="opt2">Option 2</option>
            <option value="opt3">Option 3</option>
          </select>
          <span>Selected: [[selectedOption]]</span>
        </div>
        
        <!-- Nested property binding -->
        <div>
          <input value="{{user.name::input}}">
          <span>User name: [[user.name]]</span>
        </div>
        
        <!-- Array item binding in dom-repeat -->
        <template is="dom-repeat" items="{{items}}">
          <div>
            <input value="{{item.value::input}}">
            <span>Item [[index]]: [[item.value]]</span>
          </div>
        </template>
        
        <!-- Computed binding with notify -->
        <div>
          <span>Computed (should update): [[computedFromNotify]]</span>
        </div>
        
        <!-- Property with notify: true -->
        <div>
          <button on-click="updateNotifyProperty">Update Notify Property</button>
          <span>Notify Property: [[notifyProperty]]</span>
        </div>
      </div>
    `;
  }
  
  static get properties() {
    return {
      standardValue: {
        type: String,
        value: 'initial',
        notify: true
      },
      customEventValue: {
        type: String,
        value: '',
        notify: true
      },
      isChecked: {
        type: Boolean,
        value: false,
        notify: true
      },
      selectedOption: {
        type: String,
        value: 'opt1',
        notify: true
      },
      user: {
        type: Object,
        value: () => ({ name: 'John' }),
        notify: true
      },
      items: {
        type: Array,
        value: () => [
          { value: 'Item 1' },
          { value: 'Item 2' },
          { value: 'Item 3' }
        ],
        notify: true
      },
      notifyProperty: {
        type: String,
        value: 'Initial',
        notify: true
      },
      computedFromNotify: {
        type: String,
        computed: '_computeFromNotify(standardValue, notifyProperty)'
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
}

customElements.define(NotifyEdgeCases.is, NotifyEdgeCases);