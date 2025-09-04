import { html, LitElement, css } from "lit";


class ArrayMutations extends LitElement {
  static get is() { return 'array-mutations'; }
  
  render() {
        return html`
      <div>
        <h3>Array Mutations Test</h3>
        
        <div>
          <button @click="${this.addItem}">Add Item</button>
          <button @click="${this.removeFirst}">Remove First</button>
          <button @click="${this.removeLast}">Remove Last</button>
          <button @click="${this.replaceItem}">Replace Second</button>
          <button @click="${this.clearAll}">Clear All</button>
        </div>
        
        <div>Total items: ${(this.items) ? this.items.length : undefined}</div>
        <div>Sum: ${this.sum}</div>
        
        ${((this.items) ? this.items : []).map((item, index) => html`
          <div>
            <span>${index}: </span>
            <input .value="${item.name::input}" @value-changed="${(e) => (item.name::input = e.target.value)}">
            <span> - Value: ${item.value}</span>
            <button @click="${this.removeItem}">Remove</button>
          </div>
        `)}
        
        <div>Changes log: ${this.changesLog}</div>
      </div>
    `;
              }
  
  static get properties() {
    return {
      items: {
        type: Array,
        
      },
      sum: {
        type: Number,
        
      },
      changesLog: {
        type: String,
        
      },
      counter: {
        type: Number,
        
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
get sum() {
        return _computeSum(items, items.*);
      }constructor() {
          super();
          this.changesLog = '';
this.counter = 4;
        }}

customElements.define(ArrayMutations.is, ArrayMutations);