import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class ComplexDomIf extends PolymerElement {
  static get is() { return 'complex-dom-if'; }
  
  static get template() {
    return html`
      <div>
        <template is="dom-if" if="[[showHeader]]">
          <h1>[[headerText]]</h1>
        </template>
        
        <template is="dom-if" if="[[!isLoggedIn]]">
          <button on-click="login">Login</button>
        </template>
        
        <template is="dom-if" if="[[isLoggedIn]]">
          <div>Welcome, [[username]]!</div>
          <template is="dom-if" if="[[isAdmin]]">
            <div>Admin Panel</div>
            <button on-click="adminAction">Admin Action</button>
          </template>
          <button on-click="logout">Logout</button>
        </template>
        
        <template is="dom-if" if="[[_computeShowWarning(hasError, isProduction)]]">
          <div class="warning">Warning: [[errorMessage]]</div>
        </template>
      </div>
    `;
  }
  
  static get properties() {
    return {
      showHeader: { type: Boolean, value: true },
      headerText: { type: String, value: 'Welcome' },
      isLoggedIn: { type: Boolean, value: false },
      isAdmin: { type: Boolean, value: false },
      username: { type: String, value: '' },
      hasError: { type: Boolean, value: false },
      isProduction: { type: Boolean, value: false },
      errorMessage: { type: String, value: '' }
    };
  }
  
  _computeShowWarning(hasError, isProduction) {
    return hasError && !isProduction;
  }
  
  login() {
    this.isLoggedIn = true;
    this.username = 'John Doe';
  }
  
  logout() {
    this.isLoggedIn = false;
    this.username = '';
  }
  
  adminAction() {
    console.log('Admin action performed');
  }
}

customElements.define(ComplexDomIf.is, ComplexDomIf);