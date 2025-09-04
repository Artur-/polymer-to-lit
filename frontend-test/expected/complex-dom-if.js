import { html, LitElement, css } from "lit";

class ComplexDomIf extends LitElement {
  static get is() {
    return "complex-dom-if";
  }

  render() {
    return html`
      <div>
        ${this.showHeader ? html` <h1>${this.headerText}</h1> ` : html``}
        ${!this.isLoggedIn
          ? html` <button @click="${this.login}">Login</button> `
          : html``}
        ${this.isLoggedIn
          ? html`
              <div>Welcome, ${this.username}!</div>
              ${this.isAdmin
                ? html`
                    <div>Admin Panel</div>
                    <button @click="${this.adminAction}">Admin Action</button>
                  `
                : html``}
              <button @click="${this.logout}">Logout</button>
            `
          : html``}
        ${this._computeShowWarning(this.hasError, this.isProduction)
          ? html` <div class="warning">Warning: ${this.errorMessage}</div> `
          : html``}
      </div>
    `;
  }

  static get properties() {
    return {
      showHeader: { type: Boolean },
      headerText: { type: String },
      isLoggedIn: { type: Boolean },
      isAdmin: { type: Boolean },
      username: { type: String },
      hasError: { type: Boolean },
      isProduction: { type: Boolean },
      errorMessage: { type: String },
    };
  }

  _computeShowWarning(hasError, isProduction) {
    return hasError && !isProduction;
  }

  login() {
    this.isLoggedIn = true;
    this.username = "John Doe";
  }

  logout() {
    this.isLoggedIn = false;
    this.username = "";
  }

  adminAction() {
    console.log("Admin action performed");
  }
  constructor() {
    super();
    this.showHeader = true;
    this.headerText = "Welcome";
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.username = "";
    this.hasError = false;
    this.isProduction = false;
    this.errorMessage = "";
  }
}

customElements.define(ComplexDomIf.is, ComplexDomIf);
