import * as fs from "fs";
// const process = require("process");
import * as acorn from "acorn";
import * as walk from "acorn-walk";
const htmlParse = require("node-html-parser").parse;
import * as prettier from "prettier";
import MagicString from "magic-string";

// Comparison of Lit and Polymer in https://43081j.com/2018/08/future-of-polymer

const jsInputFile = process.argv[2];
const tsOutputFile = jsInputFile.replace(".js", ".ts");
const jsContents = fs.readFileSync(jsInputFile, { encoding: "UTF-8" });
const tsOutput: MagicString = new MagicString(jsContents);
const polymerJs = acorn.parse(jsContents, { sourceType: "module" });
const initValues: any[] = [];
let valueInitPosition = -1;
let constructorInjectPosition = -1;

const body = (polymerJs as any).body;
const modifyClass = (node: any) => {
  const className = node.id.name;
  const parentClass = node.superClass;
  let tag = "";
  let template = "";

  if (parentClass.name !== "PolymerElement") {
    return;
  }
  // console.log(getSource(node.body));
  constructorInjectPosition = node.body.end - 1;

  // extends PolymerElement -> extends LitElement
  tsOutput.overwrite(node.superClass.start, node.superClass.end, "LitElement");
  for (const classContent of node.body.body) {
    if (
      classContent.type == "MethodDefinition" &&
      classContent.key.name == "template"
    ) {
      // Replace the whole template() method
      const taggedTemplate = classContent.value.body.body[0].argument;
      template = taggedTemplate.quasi.quasis[0].value.raw;
      const modifiedTemplate = modifyTemplate(template);

      const html = modifiedTemplate.htmls.join("\n");
      const css = modifiedTemplate.styles.join("\n"); //TODO
      const importStatements = imports.join("\n"); //TODO

      // console.log(getSource(classContent))
      tsOutput.overwrite(
        classContent.start,
        classContent.end,
        `render() {
return html\`${html}\`;
      }`
      );
    } else if (
      classContent.type == "MethodDefinition" &&
      classContent.key.name == "is"
    ) {
      tag = classContent.value.body.body[0].argument.value;
      // console.log(getSource(classContent));
    } else if (
      classContent.type === "MethodDefinition" &&
      classContent.kind === "get" &&
      classContent.key.name === "properties"
    ) {
      if (
        classContent.value.type === "FunctionExpression" &&
        classContent.value.body.type == "BlockStatement"
      ) {
        const returnStatment = classContent.value.body.body;

        returnStatment[0].argument.properties.forEach((prop) => {
          // console.log(prop.value.properties);
          const propName = prop.key.name;
          prop.value.properties.forEach((typeValue) => {
            const keyNode = typeValue.key;
            const valueNode = typeValue.value;
            if (keyNode.type === "Identifier" && keyNode.name === "value") {
              // Value initialization that must go into the constructor
              if (valueNode.type === "Literal") {
                const value = valueNode.name;
                const initValue = valueNode.raw;
                initValues.push({
                  name: propName,
                  value: initValue,
                });
                // console.log(propName, "=", initValue);
                // console.log(getSource(typeValue));
                removeIncludingTrailingComma(typeValue);
              }
            }
          });
        });
      }
    } else if (
      classContent.type === "MethodDefinition" &&
      classContent.kind === "constructor"
    ) {
      const constructorNode = classContent;
      // console.log(constructorNode.value.body);
      valueInitPosition = constructorNode.value.body.end - 1;
      // console.log(getSource(constructorNode.value.body));
    } else {
      // console.log("Unhandled class content", classContent);
    }
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
    // console.log(getSource(classContent));
  }
  return { className, parentClass, template, tag };
};

const removeIncludingTrailingComma = (node) => {
  if (jsContents.substring(node.end, node.end + 1) === ",") {
    tsOutput.remove(node.start, node.end + 1);
  } else {
    tsOutput.remove(node.start, node.end);
  }
  // console.log(
  //   getSource(node),
  //   "and then",
  //   jsContents.substring(node.end, node.end + 1+5)
  // );
  // if (jsContents.charAt(node.end+1)===',') {
  //   tsOutput.remove(node.end+1,node.end+1);
  // }
  // Fixme trailing ,
};
const rewriteTextNode = (node) => {
  const bindingRe = /\[\[(.+)\]\]/g;
  const bindingRe2 = /\{\{(.+)\}\}/g;

  var result = node.rawText;
  result = result.replace(bindingRe, `\${this.$1}`);
  result = result.replace(bindingRe2, `\${this.$1}`);

  node.rawText = result;
};

const rewriteElement = (element) => {
  // TODO rewrite input checked="[[checked]]" => ?checked=${this.checked}
  if (element.attributes) {
    for (const key of Object.keys(element.attributes)) {
      const value = element.attributes[key];

      if (key.startsWith("on-")) {
        const eventName = key.substring(3);
        const eventHandler = value;
        element.removeAttribute(key);
        element.setAttribute("@" + eventName, `\${this.${eventHandler}}`);
      } else if (
        (value.startsWith("[[") && value.endsWith("]]")) ||
        (value.startsWith("{{") && value.endsWith("}}"))
      ) {
        const twoWay = value.startsWith("{{");

        const expression = value.substring(2, value.length - 2);
        if (key.endsWith("$")) {
          // attribute binding prop$="[[foo]]" => prop=${this.foo}
          // console.log("Rewrite attr: ", key, value);
          element.setAttribute(
            key.replace("$", ""),
            "${" + prependWithThis(expression) + "}"
          );
          element.removeAttribute(key);
        } else {
          // property binding prop="[[foo]]" => .prop=${this.foo}
          // prop="[[!and(property1, property2)]]" => .prop=${!this.and(this.property1, this.property2)}
          // console.log("Rewrite prop: ", key, value);
          element.setAttribute(
            "." + key,
            "${" + prependWithThis(expression) + "}"
          );
          element.removeAttribute(key);
        }

        if (twoWay) {
        }
      }
    }
  }

  //
  for (const child of element.childNodes) {
    rewriteHtmlNode(child);
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
  const htmls: string[] = [];
  const styles: string[] = [];
  const styleIncludes: string[] = [];
  for (const child of root.childNodes) {
    // console.log(child);
    if (child.tagName == "custom-style" || child.tagName == "style") {
      let style;
      if (child.tagName == "custom-style") {
        style = child.childNodes[1];
      } else {
        style = child;
      }
      const includes: string = style.getAttribute("include");
      if (includes) {
        styleIncludes.push(...includes.split(" "));
      }
      // console.log(style.innerHTML);
      const css = style.innerHTML;
      styles.push(css);
    } else {
      rewriteHtmlNode(child);
      if (child.nodeType === 1) {
        htmls.push(child.outerHTML);
      } else {
        htmls.push(child.rawText);
      }
      // TODO rewrite on-click="_onClick" => @click=${(e) => this._onClick(e)}
      // TODO warn about {{foo}} or generate event handlers for known types
      // TODO rewrite dom-repeat
      // TODO rewrite dom-if
      // TODO rewrite dom-repeat
      // TODO [[]] as text
      // TODO  href="mailto:[[item.email]]"
      // TODO <template> tags
      // console.log("Child", child);
    }
  }

  const ret = { htmls, styles, styleIncludes };
  //console.log(ret);
  return ret;
};
// const getLit = (info, template, imports) => {
//   let cssModules = "";
//   let cssModuleImport = "";

//   if (template.styleIncludes.length > 0) {
//     cssModules = template.styleIncludes
//       .map((include) => `CSSModule('${include}')`)
//       .join(",");
//     cssModules += ",";

//     cssModuleImport =
//       'import { CSSModule } from "@vaadin/flow-frontend/css-utils";';
//   }

//   const output = `
//   ${importStatements}
//   import {html, LitElement, css} from 'lit';

//   ${cssModuleImport}

//   export class ${info.className} extends LitElement {
//     static get styles() {
//       return [
//       ${cssModules}
//       css\`${css}\`
//       ];
//     }

//     render() {
//       return html\`${html}\`;
//     }
//   }

//     `;
//   return prettier.format(output, { parser: "typescript" });
// };
const imports: string[] = [];
const getSource = (node: any) => {
  return jsContents.substring(node.start, node.end);
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
  if (node.type === "ClassDeclaration") {
    modifyClass(node);
  } else if (node.type === "ImportDeclaration") {
    removeImport(node, "html", "PolymerElement");
  } else {
    console.log("WARNING: Unhandled root node", node.type, getSource(node));
  }
}

tsOutput.prepend(`import { html, LitElement, css } from "lit";
`);

const valueInitCode = initValues
  .map((initValue) => {
    return `this.${initValue.name} = ${initValue.value};`;
  })
  .join("\n");

if (valueInitCode.length != 0) {
  if (valueInitPosition !== -1) {
    tsOutput.prependRight(valueInitPosition, valueInitCode);
  } else {
    // No constructor
    const constructorCode = `constructor() {
        super();
        ${valueInitCode}
      }`;
    tsOutput.prependRight(constructorInjectPosition, constructorCode);
  }
}

// const contents = getLit(info, modifiedTemplate, imports);
// fs.writeFileSync(tsOutputFile, contents);

function prependWithThis(expression: string) {
  const s = new MagicString(expression);
  const expr = acorn.parse(expression);
  // console.log((expr as any).body[0].expression.argument);
  walk.simple(expr, {
    Identifier(node: any) {
      s.overwrite(node.start, node.end, "this." + node.name);
      // console.log('Identifier',node);
    },
  });
  return s.toString();
}

console.log();
console.log("------------");
fs.writeFileSync(tsOutputFile, tsOutput.toString());
function removeImport(node: any, ...identifiers: string[]) {
  const remove: any[] = [];
  node.specifiers.forEach((specifier) => {
    if (identifiers.includes(specifier?.imported?.name)) {
      remove.push(specifier);
    }
  });
  if (remove.length === node.specifiers.length) {
    // Remove all
    tsOutput.remove(node.start, node.end);
  } else {
    console.log("ERROR: Unable to remove only part of an import");
    //FIXME Broken
    remove.forEach((specifier) => removeIncludingTrailingComma(specifier));
  }
}
function rewriteHtmlNode(child: any) {
  if (child.nodeType === 1) {
    rewriteElement(child);
  } else if (child.nodeType === 3) {
    rewriteTextNode(child);
  } else {
    console.log("unhandled child", child);
  }
}
