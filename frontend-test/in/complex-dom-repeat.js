import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class ComplexDomRepeat extends PolymerElement {
  static get is() { return 'complex-dom-repeat'; }
  
  static get template() {
    return html`
      <style>
        .item { padding: 10px; border: 1px solid #ccc; }
        .selected { background: #e0e0e0; }
      </style>
      
      <div>
        <h2>Filtered and Sorted List</h2>
        
        <input value="{{filterText::input}}" placeholder="Filter items">
        <button on-click="sortByName">Sort by Name</button>
        <button on-click="sortByAge">Sort by Age</button>
        
        <template is="dom-repeat" 
                  items="[[items]]" 
                  filter="[[_computeFilter(filterText)]]"
                  sort="[[sortFunction]]"
                  as="person"
                  index-as="idx">
          <div class$="item [[_computeItemClass(person.selected)]]">
            <span>[[idx]]. [[person.name]] (Age: [[person.age]])</span>
            <button on-click="toggleSelection" data-index$="[[idx]]">
              [[_computeButtonText(person.selected)]]
            </button>
            
            <template is="dom-repeat" items="[[person.hobbies]]" as="hobby">
              <span>• [[hobby]]</span>
            </template>
          </div>
        </template>
        
        <div>Selected count: [[selectedCount]]</div>
      </div>
    `;
  }
  
  static get properties() {
    return {
      items: {
        type: Array,
        value: () => [
          { name: 'Alice', age: 30, hobbies: ['reading', 'swimming'], selected: false },
          { name: 'Bob', age: 25, hobbies: ['gaming', 'cooking'], selected: false },
          { name: 'Charlie', age: 35, hobbies: ['hiking'], selected: false },
          { name: 'David', age: 28, hobbies: ['photography', 'travel', 'music'], selected: false }
        ]
      },
      filterText: { type: String, value: '' },
      sortFunction: { type: Function, value: null },
      selectedCount: {
        type: Number,
        computed: '_computeSelectedCount(items.*)'
      }
    };
  }
  
  _computeFilter(filterText) {
    if (!filterText) return null;
    return (item) => item.name.toLowerCase().includes(filterText.toLowerCase());
  }
  
  _computeItemClass(selected) {
    return selected ? 'selected' : '';
  }
  
  _computeButtonText(selected) {
    return selected ? 'Deselect' : 'Select';
  }
  
  _computeSelectedCount(itemsChange) {
    return this.items.filter(item => item.selected).length;
  }
  
  sortByName() {
    this.sortFunction = (a, b) => a.name.localeCompare(b.name);
  }
  
  sortByAge() {
    this.sortFunction = (a, b) => a.age - b.age;
  }
  
  toggleSelection(e) {
    const index = parseInt(e.target.dataset.index);
    this.set(`items.${index}.selected`, !this.items[index].selected);
  }
}

customElements.define(ComplexDomRepeat.is, ComplexDomRepeat);