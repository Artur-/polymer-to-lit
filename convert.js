const fs = require("fs");
const process = require("process");
const acorn = require("acorn");
const htmlParse = require("node-html-parser").parse;
const prettier = require("prettier");

// Comparison of Lit and Polymer in https://43081j.com/2018/08/future-of-polymer

const jsInput = process.argv[2];
const tsOutput = jsInput.replace(".js", ".ts");
const inputFile = fs.readFileSync(jsInput, { encoding: "UTF-8" });
const polymerJs = acorn.parse(inputFile, { sourceType: "module" });
const body = polymerJs.body;
const parseClass = (node) => {
  const className = node.id.name;
  const parentClass = node.superClass.name;
  let tag = "";
  let template = "";
  for (const classContent of node.body.body) {
    if (
      classContent.type == "MethodDefinition" &&
      classContent.key.name == "template"
    ) {
      const taggedTemplate = classContent.value.body.body[0].argument;
      template = taggedTemplate.quasi.quasis[0].value.raw;
      //   console.log(template);
    } else if (
      classContent.type == "MethodDefinition" &&
      classContent.key.name == "is"
    ) {
      tag = classContent.value.body.body[0].argument.value;
      //   console.log(tag);
    } else if (
      classContent.type == "MethodDefinition" &&
      classContent.key.name == "properties"
    ) {
      // TODO handle properties
      // static get properties() {
      //   return {
      //     myProperty: Boolean,
      //     mySecondProperty: {
      //       type: String,
      //       reflectToAttribute: true
      //     }
      //   };
      // }
      // ->
      // static get properties() {
      //   return {
      //     myProperty: { type: Boolean },
      //     mySecondProperty: {
      //       type: String,
      //       reflect: true
      //     }
      //   };
      // }
      // or
      // @property({ type: Boolean })
      // myProperty = false;
    }
  }
  return { className, parentClass, template, tag };
};

const replaceProperties = (element) => {
  // TODO rewrite input checked="[[checked]]" => ?checked=${this.checked}
  if (element.attributes) {
    for (const key of Object.keys(element.attributes)) {
      const value = element.attributes[key];
      if (key.endsWith("$") && value.startsWith("[[") && value.endsWith("]]")) {
        // rewrite prop$="[[foo]]" => prop=${this.foo}
        console.log("Rewrite attr: ", key, value);
        const propertyName = value.replace("[[", "").replace("]]", "");
        element.setAttribute(
          key.replace("$", ""),
          "${this." + propertyName + "}"
        );
        element.removeAttribute(key);
      } else if (value.startsWith("[[") && value.endsWith("]]")) {
        // rewrite prop="[[foo]]" => .prop=${this.foo}
        console.log("Rewrite prop: ", key, value);
        const propertyName = value.replace("[[", "").replace("]]", "");
        element.setAttribute("." + key, "${this." + propertyName + "}");
        element.removeAttribute(key);
      }
    }
  }
  //
  for (child of element.childNodes) {
    replaceProperties(child);
  }
};
const modifyTemplate = (inputHtml) => {
  //  if (inputHtml.includes("}}")) {
  //   throw "Template contains two way bindings which are not supported";
  // }
  const root = htmlParse(inputHtml, {
    lowerCaseTagName: true,
    script: true,
    style: true,
    pre: true,
    comment: true,
  });
  //console.log(root.innerHTML);
  const htmls = [];
  const styles = [];
  const styleIncludes = [];
  for (const child of root.childNodes) {
    // console.log(child);
    if (child.tagName == "custom-style" || child.tagName == "style") {
      let style;
      if (child.tagName == "custom-style") {
        style = child.childNodes[1];
      } else {
        style = child;
      }
      const includes = style.getAttribute("include");
      if (includes) {
        styleIncludes.push(...includes.split(" "));
      }
      // console.log(style.innerHTML);
      const css = style.innerHTML;
      styles.push(css);
    } else if (child.nodeType == 1) {
      // TODO rewrite on-click="_onClick" => @click=${(e) => this._onClick(e)}
      // TODO warn about {{foo}} or generate event handlers for known types
      // TODO rewrite dom-repeat
      // TODO rewrite dom-if
      // TODO rewrite dom-repeat
      // TODO [[]] as text
      // TODO  href="mailto:[[item.email]]"
      // TODO <template> tags
      replaceProperties(child);
      htmls.push(child.outerHTML);
    }
  }

  const ret = { htmls, styles, styleIncludes };
  //console.log(ret);
  return ret;
};
const getLit = (info, template, imports) => {
  let cssModules = "";
  let cssModuleImport = "";

  if (template.styleIncludes.length > 0) {
    cssModules = template.styleIncludes
      .map((include) => `CSSModule('${include}')`)
      .join(",");
    cssModules += ",";

    cssModuleImport =
      'import { CSSModule } from "@vaadin/flow-frontend/css-utils";';
  }

  const css = template.styles.join("\n");
  const html = template.htmls.join("\n");
  const importStatements = imports.join("\n");
  const output = `
  ${importStatements}
  import {customElement, html, LitElement, css} from 'lit-element';

  ${cssModuleImport}

  @customElement('${info.tag}')
  export class ${info.className} extends LitElement {
    static get styles() {
      return [
      ${cssModules}
      css\`${css}\`
      ];
    }

    render() {
      return html\`${html}\`;  
    }
  }
        

    `;
  return prettier.format(output, { parser: "typescript" });
};
const imports = [];
const getSource = (node) => {
  return inputFile.substring(node.start, node.end);
};
const skipImports = [
  "@polymer/polymer/polymer-element.js",
  "@polymer/polymer/lib/utils/html-tag.js",
];
for (const node of body) {
  if (node.type == "ImportDeclaration") {
    /*    if (node.specifiers) {
      node.specifiers.forEach((specifier) => console.log(specifier));
    }
    console.log(Object.keys(node));
    */

    if (!skipImports.includes(node.source.value)) {
      // console.log(node.source);
      imports.push(getSource(node));
    }
  }
}
for (const node of body) {
  if (node.type == "ClassDeclaration") {
    const info = parseClass(node);
    const modifiedTemplate = modifyTemplate(info.template);
    // console.log(modifiedTemplate);

    const contents = getLit(info, modifiedTemplate, imports);
    fs.writeFileSync(tsOutput, contents);
  }
}
