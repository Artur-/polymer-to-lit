const fs = require("fs");
const process = require("process");

const javaInput = process.argv[2];
let contents = fs.readFileSync(javaInput, { encoding: "UTF-8" });

const tagMatch = contents.match(/@Tag\("(.*)"\)/);
if (!tagMatch) {
  return;
}
const tag = tagMatch[1];

contents = contents.replace(
  "import com.vaadin.flow.component.polymertemplate.PolymerTemplate;",
  "import com.vaadin.flow.component.littemplate.LitTemplate;"
);
contents = contents.replace(
  "import com.vaadin.flow.templatemodel.TemplateModel;",
  ""
);

contents = contents.replace(
  /extends PolymerTemplate<.*>/,
  "extends LitTemplate"
);

// If the model is empty, delete it
contents = contents.replace(
  /public static interface .* extends TemplateModel {.*}/,
  ""
);

var replace = '@JsModule\\("(.*)' + tag + '.js"\\)';
var re = new RegExp(replace);

contents = contents.replace(re, '@JsModule("$1' + tag + '.ts")');

fs.writeFileSync(javaInput, contents);
