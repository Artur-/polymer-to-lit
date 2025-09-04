import { html, LitElement, css } from "lit";

class ComplexObservers extends LitElement {
  static get is() {
    return "complex-observers";
  }

  render() {
    return html`
      <div>
        <h3>Complex Observers Test</h3>
        <div>Name: ${this.firstName} ${this.lastName}</div>
        <div>Full Name: ${this.fullName}</div>
        <div>Validation: ${this.validationMessage}</div>
        <div>Status: ${this.status}</div>
        <div>User Info: ${this.userInfo}</div>
        <div>Deep Path: ${this.deepValue}</div>
      </div>
    `;
  }

  static get properties() {
    return {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      fullName: {
        type: String,
      },
      age: {
        type: Number,
      },
      validationMessage: {
        type: String,
      },
      status: {
        type: String,
      },
      userObject: {
        type: Object,
      },
      deepValue: {
        type: String,
      },
      userInfo: {
        type: String,
      },
    };
  }

  static get observers() {
    return [
      "_multiplePropertiesChanged(firstName, lastName, age)",
      "_statusAndAgeChanged(status, age)",
      "_userObjectChanged(userObject.*)",
      "_deepPathChanged(userObject.profile.settings.theme)",
      "_wildcardChanged(userObject.profile.*)",
    ];
  }

  _firstNameChanged(newVal, oldVal) {
    console.log(`First name changed from ${oldVal} to ${newVal}`);
  }

  _lastNameChanged(newVal, oldVal) {
    console.log(`Last name changed from ${oldVal} to ${newVal}`);
  }

  _ageChanged(newVal, oldVal) {
    if (newVal < 0) {
      this.validationMessage = "Age cannot be negative";
    } else if (newVal > 120) {
      this.validationMessage = "Age seems unrealistic";
    } else {
      this.validationMessage = "";
    }
  }

  _computeFullName(first, last) {
    return `${first} ${last}`;
  }

  _multiplePropertiesChanged(firstName, lastName, age) {
    this.userInfo = `${firstName} ${lastName}, age ${age}`;
  }

  _statusAndAgeChanged(status, age) {
    console.log(`Status: ${status}, Age: ${age}`);
  }

  _userObjectChanged(changeRecord) {
    console.log("User object changed:", changeRecord);
  }

  _deepPathChanged(theme) {
    this.deepValue = `Theme is ${theme}`;
  }

  _wildcardChanged(changeRecord) {
    console.log("Profile changed:", changeRecord);
  }
  get fullName() {
    return this._computeFullName(this.firstName, this.lastName);
  }
  set firstName(newValue) {
    const oldValue = this.firstName;
    this._firstName = newValue;
    if (oldValue !== newValue) {
      this._firstNameChanged(newValue, oldValue);
      this.requestUpdateInternal(
        "firstName",
        oldValue,
        this.constructor.properties.firstName,
      );
    }
  }
  get firstName() {
    return this._firstName;
  }

  set lastName(newValue) {
    const oldValue = this.lastName;
    this._lastName = newValue;
    if (oldValue !== newValue) {
      this._lastNameChanged(newValue, oldValue);
      this.requestUpdateInternal(
        "lastName",
        oldValue,
        this.constructor.properties.lastName,
      );
    }
  }
  get lastName() {
    return this._lastName;
  }

  set age(newValue) {
    const oldValue = this.age;
    this._age = newValue;
    if (oldValue !== newValue) {
      this._ageChanged(newValue, oldValue);
      this.requestUpdateInternal(
        "age",
        oldValue,
        this.constructor.properties.age,
      );
    }
  }
  get age() {
    return this._age;
  }
  constructor() {
    super();
    this.firstName = "John";
    this.lastName = "Doe";
    this.age = 0;
    this.validationMessage = "";
    this.status = "inactive";
    this.deepValue = "";
    this.userInfo = "";
  }
}

customElements.define(ComplexObservers.is, ComplexObservers);
