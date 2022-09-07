import * as fs from "fs";
// const process = require("process");
import * as acorn from "acorn";
import * as walk from "acorn-walk";
import MagicString from "magic-string";
import * as prettier from "prettier";
const htmlParse = require("node-html-parser").parse;

// Comparison of Lit and Polymer in https://43081j.com/2018/08/future-of-polymer

const jsInputFile = process.argv[2];
let tsOutputFile;
if (process.argv[3] === "-o") {
  tsOutputFile = jsInputFile;
} else {
  tsOutputFile = jsInputFile.replace(".js", ".out.js");
}
const useOptionalChaining = false;

const jsContents = fs.readFileSync(jsInputFile, { encoding: "UTF-8" });
const tsOutput: MagicString = new MagicString(jsContents);
const polymerJs = acorn.parse(jsContents, { sourceType: "module" });
const initValues: any[] = [];
const computedProperties: any[] = [];
const observedProperties: any[] = [];
let valueInitPosition = -1;
let newMethodInjectPosition = -1;
let usesRepeat = false;
let usesHeaderRenderer = false;
let usesBodyRenderer = false;
let usesFooterRenderer = false;

function error(message?: any, ...optionalParams: any[]) {
  console.error("ERROR", message, optionalParams);
}
function warn(message?: any, ...optionalParams: any[]) {
  console.warn("WARNING", message, optionalParams);
}
function debug(message?: any, ...optionalParams: any[]) {
  console.log(message, optionalParams);
}
const body = (polymerJs as any).body;
const modifyClass = (node: any) => {
  const className = node.id.name;
  const parentClass = node.superClass;
  let tag = "";
  let template = "";

  if (parentClass.name !== "PolymerElement") {
    return;
  }
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
      // const css = modifiedTemplate.styles.join("\n"); //TODO
      const hasStyles = modifiedTemplate.styles.length > 0;
      const stylesGetter = `  static get styles() {
        return [
          ${modifiedTemplate.styles.map((css) => `css\`${css}\``).join(",")}
        ];
      }`;

      const renderMethod = `render() {
        return html\`${html}\`;
              }`;
      tsOutput.overwrite(
        classContent.start,
        classContent.end,
        (hasStyles ? stylesGetter : "") + renderMethod
      );
    } else if (
      classContent.type == "MethodDefinition" &&
      classContent.key.name == "is"
    ) {
      tag = classContent.value.body.body[0].argument.value;
      // debug(getSource(classContent));
    } else if (
      classContent.type == "MethodDefinition" &&
      classContent.key.name == "_attachDom"
    ) {
      // Assume this means it it using light dom
      tsOutput.overwrite(
        classContent.start,
        classContent.end,
        `createRenderRoot() {
          // Do not use a shadow root
          return this;
        }
        `
      );
    } else if (
      classContent.type == "MethodDefinition" &&
      classContent.key.name == "ready"
    ) {
      // There is no 'ready' callback but it is approximately run at the same time as 'firstUpdated'
      // tsOutput.overwrite(classContent.key.start, classContent.key.end, "firstUpdated");
      // debug(classContent);
      const src = getSource(classContent);
      tsOutput.overwrite(
        classContent.start,
        classContent.end,
        src
          .replace("ready()", "firstUpdated(_changedProperties)")
          .replace("super.ready()", "super.firstUpdated(_changedProperties)")
      );
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
          // debug(prop);
          const propName = prop.key.name;

          if (prop.value.type === "Identifier") {
            // first: String
            // type of property
          } else {
            prop.value.properties.forEach((typeValue) => {
              const keyNode = typeValue.key;
              const valueNode = typeValue.value;

              if (keyNode.type === "Identifier") {
                if (keyNode.name === "value") {
                  // Value initialization that must go into the constructor
                  if (valueNode.type === "Literal") {
                    const initValue = valueNode.raw;
                    initValues.push({
                      name: propName,
                      value: initValue,
                    });
                  } else if (valueNode.type === "FunctionExpression") {
                    if (valueNode?.body?.body[0]?.type === "ReturnStatement") {
                      const arrayExpression = getSource(
                        valueNode.body.body[0].argument
                      );
                      initValues.push({
                        name: propName,
                        value: arrayExpression,
                      });
                    }
                  } else if (valueNode.type === "ArrayExpression") {
                    initValues.push({
                      name: propName,
                      value: getSource(valueNode),
                    });
                  } else {
                    warn(
                      "UNKNOWN type of 'value' for property",
                      propName,
                      ":",
                      valueNode.type
                    );
                  }
                  removeIncludingTrailingComma(typeValue);
                } else if (keyNode.name === "computed") {
                  computedProperties.push({
                    name: propName,
                    value: thisResolver(valueNode.value),
                  });
                  removeIncludingTrailingComma(typeValue);
                } else if (keyNode.name === "observer") {
                  const observer = valueNode.value;
                  if (observer.includes("(")) {
                    // Complex observer
                    tsOutput.prependLeft(
                      valueNode.start,
                      "/* TODO: Convert this complex observer manually */\n"
                    );
                  } else {
                    observedProperties.push({
                      name: propName,
                      value: observer,
                    });
                    removeIncludingTrailingComma(typeValue);
                  }
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
      valueInitPosition = constructorNode.value.body.end - 1;
    } else {
      // warn("Unhandled class content", classContent);
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
    // debug(getSource(classContent));
  }
  return { className, parentClass, template, tag };
};

const removeIncludingTrailingComma = (node) => {
  if (jsContents.substring(node.end, node.end + 1) === ",") {
    tsOutput.remove(node.start, node.end + 1);
  } else {
    tsOutput.remove(node.start, node.end);
  }
  // debug(
  //   getSource(node),
  //   "and then",
  //   jsContents.substring(node.end, node.end + 1+5)
  // );
  // if (jsContents.charAt(node.end+1)===',') {
  //   tsOutput.remove(node.end+1,node.end+1);
  // }
  // Fixme trailing ,
};
const rewriteTextNode = (node, resolver) => {
  const bindingRe = /\[\[(.+?)\]\]/g;
  const bindingRe2 = /\{\{(.+?)\}\}/g;

  var result = node.rawText;
  result = result.replace(bindingRe, (_fullMatch, variableName) => {
    const resolved = resolver(variableName);
    return `\${${resolved}}`;
  });
  result = result.replace(bindingRe2, (_fullMatch, variableName) => {
    const resolved = resolver(variableName);
    return `\${${resolved}}`;
  });
  node.rawText = result;
};

type Resolver = (expression: string) => string;

const rewriteElement = (element: any, resolver: Resolver) => {
  if (
    element.tagName === "TEMPLATE" &&
    element.getAttribute("is") === "dom-if"
  ) {
    const polymerExpression = element.getAttribute("if");
    replaceWithLitIf(element, polymerExpression, resolver, element);
    return;
  } else if (element.tagName === "DOM-IF") {
    const template = element.childNodes.filter(
      (el) => el.tagName === "TEMPLATE"
    )[0];
    const polymerExpression = element.getAttribute("if");
    replaceWithLitIf(element, polymerExpression, resolver, template);
    return;
  } else if (element.tagName === "DOM-REPEAT") {
    const template = element.childNodes.filter(
      (el) => el.tagName === "TEMPLATE"
    )[0];
    const polymerItemsExpression = element.getAttribute("items");
    replaceWithLitRepeat(element, polymerItemsExpression, resolver, template);
    return;
  } else if (
    element.tagName === "TEMPLATE" &&
    element.getAttribute("is") === "dom-repeat"
  ) {
    const polymerItemsExpression = element.getAttribute("items");
    replaceWithLitRepeat(element, polymerItemsExpression, resolver, element);
    return;
  } else if (element.tagName === "VAADIN-GRID-COLUMN") {
    const templates = element.childNodes.filter(
      (child) => child.tagName === "TEMPLATE"
    );
    const headerTemplate = templates.find(
      (template) => template.getAttribute("class") === "header"
    );
    const bodyTemplate = templates.find(
      (template) => !template.hasAttribute("class")
    );
    const footerTemplate = templates.find(
      (template) => template.getAttribute("class") === "footer"
    );

    if (headerTemplate) {
      usesHeaderRenderer = true;
      headerTemplate.childNodes.forEach((child) =>
        rewriteHtmlNode(child, resolver)
      );

      element.setAttribute(
        `\${columnHeaderRenderer(
        (column) =>
          html\`${headerTemplate.innerHTML}\`
      )}
      `,
        ""
      );
      headerTemplate.remove();
    }
    if (bodyTemplate) {
      usesBodyRenderer = true;
      bodyTemplate.childNodes.forEach((child) =>
        rewriteHtmlNode(child, (expression) => {
          if (expression.startsWith("item.")) {
            return nullSafe(expression);
          }

          return resolver(expression);
        })
      );

      element.setAttribute(
        `\${columnBodyRenderer(
        (item) =>
          html\`${bodyTemplate.innerHTML}\`
      )}
      `,
        ""
      );
      bodyTemplate.remove();
    }
    if (footerTemplate) {
      usesFooterRenderer = true;
      footerTemplate.childNodes.forEach((child) =>
        rewriteHtmlNode(child, resolver)
      );

      element.setAttribute(
        `\${columnFooterRenderer(
        (column) =>
          html\`${footerTemplate.innerHTML}\`
      )}
      `,
        ""
      );
      footerTemplate.remove();
    }
  } else if (element.attributes) {
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
          // debug("Rewrite attr: ", key, value);
          element.setAttribute(
            key.replace("$", ""),
            "${" + resolver(expression) + "}"
          );
          element.removeAttribute(key);
        } else {
          // property binding prop="[[foo]]" => .prop=${this.foo}
          // prop="[[!and(property1, property2)]]" => .prop=${!this.and(this.property1, this.property2)}
          // debug("Rewrite prop: ", key, value);
          element.setAttribute("." + key, "${" + resolver(expression) + "}");
          element.removeAttribute(key);
        }

        if (twoWay) {
          // @value-change=${(e) => (this.name = e.target.value)}
          const eventName = key + "-changed";
          const attributeKey = "@" + eventName;
          const attributeValue = `\${(e) => (${resolver(
            expression
          )} = e.target.value)}`;
          element.setAttribute(attributeKey, attributeValue);
        }
      }
    }
  }

  //
  for (const child of element.childNodes) {
    rewriteHtmlNode(child, resolver);
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
  // debug(root.innerHTML);
  const htmls: string[] = [];
  const styles: string[] = [];
  const styleIncludes: string[] = [];
  for (const child of root.childNodes) {
    // debug(child);
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
      const css = style.innerHTML;
      styles.push(css);
      child.remove();
    } else {
      rewriteHtmlNode(child, thisResolver);
      // if (child.nodeType === 1) {
      //   htmls.push(child.outerHTML);
      // } else {
      //   htmls.push(child.rawText);
      // }
      // TODO rewrite dom-repeat
      // TODO rewrite dom-if
      // TODO rewrite dom-repeat
      // TODO  href="mailto:[[item.email]]"
      // TODO <template> tags
    }
  }
  htmls.push(root.innerHTML);

  const ret = { htmls, styles, styleIncludes };
  //debug(ret);
  return ret;
};

const getSource = (node: any) => {
  return jsContents.substring(node.start, node.end);
};
const skipImports = [
  "@polymer/polymer/polymer-element.js",
  "@polymer/polymer/lib/utils/html-tag.js",
];
for (const node of body) {
  if (node.type === "ClassDeclaration") {
    modifyClass(node);
  } else if (node.type === "ImportDeclaration") {
    removeImport(node, "html", "PolymerElement");
    removeImport(node, "@polymer/polymer/lib/elements/dom-if.js");
    removeImport(node, "@polymer/polymer/lib/elements/dom-repeat.js");
  } else if (!getSource(node).includes("customElements.define")) {
    warn("Unhandled root node", node.type, getSource(node));
  }
}

tsOutput.prepend(`import { html, LitElement, css } from "lit";\n`);
if (usesRepeat) {
  tsOutput.prepend(`import { repeat } from "lit/directives/repeat.js";\n`);
}

const usedRenderers: string[] = [];
if (usesBodyRenderer) usedRenderers.push("columnBodyRenderer");
if (usesFooterRenderer) usedRenderers.push("columnFooterRenderer");
if (usesHeaderRenderer) usedRenderers.push("columnHeaderRenderer");
if (usedRenderers.length !== 0) {
  tsOutput.prepend(
    `import { ${usedRenderers.join(", ")} } from "@vaadin/grid/lit.js";\n`
  );
}

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

const observedPropertiesCode = observedProperties
  .map((observedProperty) => {
    const variable = observedProperty.name;
    const observer = observedProperty.value;
    return `set ${variable}(newValue) {
      const oldValue = this.${variable};
      this._${variable} = newValue;
      if (oldValue !== newValue) {
        this.${observer}(newValue, oldValue);
      }
    }
    get ${variable}() {
      return this._${variable};
    }
  `;
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

if (observedPropertiesCode.length != 0) {
  tsOutput.prependRight(newMethodInjectPosition, observedPropertiesCode);
}
if (computedPropertiesCode.length != 0) {
  tsOutput.prependRight(newMethodInjectPosition, computedPropertiesCode);
}

function thisResolver(expression: string) {
  // debug("Resolve", expression);
  const s = new MagicString(expression);
  const expr: any = (acorn.parse(expression) as any).body[0];
  if (expr.type === "ExpressionStatement") {
    if (expr.expression.type === "MemberExpression") {
      const result = expression.substring(
        expr.expression.start,
        expr.expression.end
      );
      return nullSafe(result);
    }
  }

  warn("Unresolved expression", expression);
  return expression;
}

let output = tsOutput.toString();
output = output.replace(
  /this.\$.([^;., ()]*)/g,
  `this.renderRoot.querySelector("#$1")`
);
const prettified = prettier.format(output, {
  parser: "typescript",
});
fs.writeFileSync(tsOutputFile, prettified);
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
    error("Unable to remove only part of an import");
    //FIXME Broken
    remove.forEach((specifier) => removeIncludingTrailingComma(specifier));
  }
}
function rewriteHtmlNode(child: any, resolver: Resolver) {
  if (child.nodeType === 1) {
    rewriteElement(child, resolver);
  } else if (child.nodeType === 3) {
    rewriteTextNode(child, resolver);
  } else {
    warn("unhandled child", child);
  }
}
function replaceWithLitIf(
  element: any,
  polymerExpression: string,
  resolver: Resolver,
  template: any
) {
  const expression = polymerExpression.substring(
    2,
    polymerExpression.length - 2
  );

  const litExpression = resolver(expression);
  template.childNodes.forEach((child) => rewriteElement(child, resolver));
  const litIf = `\${${litExpression} ? html\`${template.innerHTML}\` : html\`\`}`;
  element.replaceWith(litIf);
}
function replaceWithLitRepeat(
  element: any,
  polymerItemsExpression: string,
  resolver: Resolver,
  template: any
) {
  const expression = polymerItemsExpression.substring(
    2,
    polymerItemsExpression.length - 2
  );
  const litExpression = resolver(expression);
  template.childNodes.forEach((child) =>
    rewriteElement(child, (expression) => {
      if (expression === "index") {
        return "index";
      }
      if (expression.startsWith("item.")) {
        // This is the loop variable
        return nullSafe(expression);
      }

      return resolver(expression);
    })
  );

  const litRepeat = `\${${litExpression}.map(
    (item, index) => html\`${template.innerHTML}\`)}`;
  element.replaceWith(litRepeat);
}
function nullSafe(name: any) {
  // Polymer allows using "a.b.c" when "a" or "b" is undefined
  // webpack 4 does not support ?. so to be compati
  if (useOptionalChaining) {
    return name.replace(/\./g, "?.");
  } else {
    // this.a -> this.a
    // this.a.b -> (this.a) ? this.a.b : undefined
    // this.a.b.c -> (this.a && this.a.b) ? this.a.b.c : undefined
    // item.foo -> (item) ? item.foo
    // item.foo.bar -> (item && item.foo) ? item.foo.bar : undefined

    // debug("nullSafe", name);

    const parts = name.split(".");

    let condition = "";
    for (var i = 1; i < parts.length; i++) {
      let subParts = parts[0];
      for (var j = 1; j < i; j++) {
        subParts += "." + parts[j];
      }

      if (condition !== "") {
        condition += " && ";
      }

      if (subParts !== "this") {
        condition += subParts;
      }
    }
    if (condition) {
      const ret = `(${condition}) ? ${name} : undefined`;
      // debug(ret);
      return ret;
    } else {
      return name;
    }
  }
}
