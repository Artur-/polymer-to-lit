import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../../../styles/shared-styles.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

class TemplateModelSubProperties extends PolymerElement {
  static get template() {
    return html`
    <div class="content">
      <div class="group-heading" hidden\$="[[!header]]">
        <span class="main">[[header.main]]</span>
        <span class="secondary">[[header.secondary]]</span>
      </div>
    </div>
`;
  }

  static get is() {
    return 'template-model-sub-properties';
  }

}

window.customElements.define(TemplateModelSubProperties.is, TemplateModelSubProperties);
