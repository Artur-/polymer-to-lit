import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class ArrayMutations extends PolymerElement {
  static get is() { return 'array-mutations'; }
  
  static get template() {
    return html`
      <div>
        <h3>Array Mutations Test</h3>
        
        <div>
          <button on-click="addItem">Add Item</button>
          <button on-click="removeFirst">Remove First</button>
          <button on-click="removeLast">Remove Last</button>
          <button on-click="replaceItem">Replace Second</button>
          <button on-click="clearAll">Clear All</button>
        </div>
        
        <div>Total items: [[items.length]]</div>
        <div>Sum: [[sum]]</div>
        
        <template is="dom-repeat" items="{{items}}">
          <div>
            <span>[[index]]: </span>
            <input value="{{item.name::input}}">
            <span> - Value: [[item.value]]</span>
            <button on-click="removeItem">Remove</button>
          </div>
        </template>
        
        <div>Changes log: [[changesLog]]</div>
      </div>
    `;
  }
  
  static get properties() {
    return {
      items: {
        type: Array,
        value: () => [
          { name: 'Item 1', value: 10 },
          { name: 'Item 2', value: 20 },
          { name: 'Item 3', value: 30 }
        ]
      },
      sum: {
        type: Number,
        computed: '_computeSum(items, items.*)'
      },
      changesLog: {
        type: String,
        value: ''
      },
      counter: {
        type: Number,
        value: 4
      }
    };
  }
  
  static get observers() {
    return [
      '_itemsChanged(items.splices)',
      '_itemsLengthChanged(items.length)'
    ];
  }
  
  _computeSum(items, itemsChange) {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + item.value, 0);
  }
  
  _itemsChanged(changeRecord) {
    if (changeRecord && changeRecord.indexSplices) {
      this.changesLog = `Array changed: ${JSON.stringify(changeRecord.indexSplices[0])}`;
    }
  }
  
  _itemsLengthChanged(length) {
    console.log(`Array length is now: ${length}`);
  }
  
  addItem() {
    const newItem = { 
      name: `Item ${this.counter}`, 
      value: this.counter * 10 
    };
    this.push('items', newItem);
    this.counter++;
  }
  
  removeFirst() {
    if (this.items.length > 0) {
      this.shift('items');
    }
  }
  
  removeLast() {
    if (this.items.length > 0) {
      this.pop('items');
    }
  }
  
  removeItem(e) {
    const index = e.model.index;
    this.splice('items', index, 1);
  }
  
  replaceItem() {
    if (this.items.length > 1) {
      this.set('items.1', { 
        name: 'Replaced Item', 
        value: 999 
      });
    }
  }
  
  clearAll() {
    this.splice('items', 0, this.items.length);
  }
}

customElements.define(ArrayMutations.is, ArrayMutations);