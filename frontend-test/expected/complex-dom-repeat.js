import { html, LitElement, css } from "lit";


class ComplexDomRepeat extends LitElement {
  static get is() { return 'complex-dom-repeat'; }
  
    static get styles() {
        
        
        return [
          
        css`
        .item { padding: 10px; border: 1px solid #ccc; }
        .selected { background: #e0e0e0; }
      `
        ];
      }render() {
        return html`
      
      
      <div>
        <h2>Filtered and Sorted List</h2>
        
        <input placeholder="Filter items" .value="${filterText::input}" @value-changed="${(e) => (filterText::input = e.target.value)}">
        <button @click="${this.sortByName}">Sort by Name</button>
        <button @click="${this.sortByAge}">Sort by Age</button>
        
        ${((this.items) ? this.items : []).map((item, index) => html`
          <div class="${'item '+(((this._computeItemClass) ? this._computeItemClass : '')((this.person && this.person.selected) ? this.person.selected : ''))}">
            <span>${this.idx}. ${(this.person) ? this.person.name : undefined} (Age: ${(this.person) ? this.person.age : undefined})</span>
            <button @click="${this.toggleSelection}" data-index="${this.idx}">
              ${(this._computeButtonText)((this.person) ? this.person.selected : undefined)}
            </button>
            
            ${((this.person && this.person.hobbies) ? this.person.hobbies : []).map((item, index) => html`
              <span>• ${this.hobby}</span>
            `)}
          </div>
        `)}
        
        <div>Selected count: ${this.selectedCount}</div>
      </div>
    `;
              }
  
  static get properties() {
    return {
      items: {
        type: Array,
        
      },
      filterText: { type: String,  },
      sortFunction: { type: Function,  },
      selectedCount: {
        type: Number,
        
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
get selectedCount() {
        return _computeSelectedCount(items.*);
      }constructor() {
          super();
          this.filterText = '';
this.sortFunction = null;
        }}

customElements.define(ComplexDomRepeat.is, ComplexDomRepeat);