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
const computedProperties: any[] = [];
let valueInitPosition = -1;
let newMethodInjectPosition = -1;

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
  newMethodInjectPosition = node.body.end - 1;

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
          // console.log(prop);
          const propName = prop.key.name;

          if (prop.value.type === "Identifier") {
            // first: String
            // type of property
          } else {
            // console.log(prop.value.type);
            prop.value.properties.forEach((typeValue) => {
              const keyNode = typeValue.key;
              const valueNode = typeValue.value;
              if (keyNode.type === "Identifier") {
                if (keyNode.name === "value") {
                  // Value initialization that must go into the constructor
                  if (valueNode.type === "Literal") {
                    // const value = valueNode.name;
                    const initValue = valueNode.raw;
                    initValues.push({
                      name: propName,
                      value: initValue,
                    });
                    // console.log(propName, "=", initValue);
                    // console.log(getSource(typeValue));
                    removeIncludingTrailingComma(typeValue);
                  }
                } else if (keyNode.name === "computed") {
                  computedProperties.push({
                    name: propName,
                    value: prependWithThis(valueNode.value),
                  });
                  removeIncludingTrailingComma(typeValue);
                }
              }
            });
          }
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
  if (
    element.tagName === "TEMPLATE" &&
    element.getAttribute("is") === "dom-if"
  ) {
    const ifAttr = element.getAttribute("if");
    const expression = ifAttr.substring(2, ifAttr.length - 2);

    replaceWithLitIf(element, expression, element.innerHTML);

    // console.log(element);
    // } else
  } else if (element.tagName === "DOM-IF") {
    const template = element.childNodes.filter(
      (el) => el.tagName === "TEMPLATE"
    )[0];
    const ifAttr = element.getAttribute("if");
    const expression = ifAttr.substring(2, ifAttr.length - 2);

    replaceWithLitIf(element, expression, template.innerHTML);
  }
  if (element.attributes) {
    // TODO rewrite input checked="[[checked]]" => ?checked=${this.checked}
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
          // @value-change=${(e) => (this.name = e.target.value)}
          const eventName = key + "-changed";
          const attributeKey = "@" + eventName;
          const attributeValue = `\${(e) => (${prependWithThis(
            expression
          )} = e.target.value)}`;
          element.setAttribute(attributeKey, attributeValue);
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
  // console.log(root.innerHTML);
  const htmls: string[] = [];
  const styles: string[] = [];
  const styleIncludes: string[] = [];
  for (const child of root.childNodes) {
    // console.log(child);
    if (child.tagName == "CUSTOM-STYLE" || child.tagName == "STYLE") {
      let style;
      if (child.tagName == "CUSTOM-STYLE") {
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
      // TODO rewrite dom-repeat
      // TODO rewrite dom-if
      // TODO rewrite dom-repeat
      // TODO  href="mailto:[[item.email]]"
      // TODO <template> tags
    }
  }

  const ret = { htmls, styles, styleIncludes };
  //console.log(ret);
  return ret;
};

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
    removeImport(node, "@polymer/polymer/lib/elements/dom-if.js");
  } else if (!getSource(node).includes("customElements.define")) {
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

const computedPropertiesCode = computedProperties
  .map((computedProperty) => {
    return `get ${computedProperty.name}() {
      return ${computedProperty.value};
    }`;
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
    tsOutput.prependRight(newMethodInjectPosition, constructorCode);
  }
}

if (computedPropertiesCode.length != 0) {
  tsOutput.prependRight(newMethodInjectPosition, computedPropertiesCode);
}
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
function removeImport(node: any, ...identifiersOrFrom: string[]) {
  const remove: any[] = [];
  if (identifiersOrFrom.includes(node.source.value)) {
    tsOutput.remove(node.start, node.end);
    return;
  }
  node.specifiers.forEach((specifier) => {

    if (identifiersOrFrom.includes(specifier?.imported?.name)) {
      remove.push(specifier);
    }
  });
  if (remove.length === 0) {
    return;
  }
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
function replaceWithLitIf(element: any, expression: string, content: string) {
  const litExpression = prependWithThis(expression);
  const litIf = `\${${litExpression} ? html\`${content}\` : html\`\`}`;
  element.replaceWith(litIf);
}
