import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class ComplexObservers extends PolymerElement {
  static get is() { return 'complex-observers'; }
  
  static get template() {
    return html`
      <div>
        <h3>Complex Observers Test</h3>
        <div>Name: [[firstName]] [[lastName]]</div>
        <div>Full Name: [[fullName]]</div>
        <div>Validation: [[validationMessage]]</div>
        <div>Status: [[status]]</div>
        <div>User Info: [[userInfo]]</div>
        <div>Deep Path: [[deepValue]]</div>
      </div>
    `;
  }
  
  static get properties() {
    return {
      firstName: {
        type: String,
        value: 'John',
        observer: '_firstNameChanged'
      },
      lastName: {
        type: String,
        value: 'Doe',
        observer: '_lastNameChanged'
      },
      fullName: {
        type: String,
        computed: '_computeFullName(firstName, lastName)'
      },
      age: {
        type: Number,
        value: 0,
        observer: '_ageChanged'
      },
      validationMessage: {
        type: String,
        value: ''
      },
      status: {
        type: String,
        value: 'inactive'
      },
      userObject: {
        type: Object,
        value: () => ({ 
          profile: { 
            settings: { 
              theme: 'light' 
            } 
          } 
        })
      },
      deepValue: {
        type: String,
        value: ''
      },
      userInfo: {
        type: String,
        value: ''
      }
    };
  }
  
  static get observers() {
    return [
      '_multiplePropertiesChanged(firstName, lastName, age)',
      '_statusAndAgeChanged(status, age)',
      '_userObjectChanged(userObject.*)',
      '_deepPathChanged(userObject.profile.settings.theme)',
      '_wildcardChanged(userObject.profile.*)'
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
      this.validationMessage = 'Age cannot be negative';
    } else if (newVal > 120) {
      this.validationMessage = 'Age seems unrealistic';
    } else {
      this.validationMessage = '';
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
    console.log('User object changed:', changeRecord);
  }
  
  _deepPathChanged(theme) {
    this.deepValue = `Theme is ${theme}`;
  }
  
  _wildcardChanged(changeRecord) {
    console.log('Profile changed:', changeRecord);
  }
}

customElements.define(ComplexObservers.is, ComplexObservers);