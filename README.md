# Polymer to Lit Converter

A robust command-line tool for converting Polymer 3 components to Lit (LitElement).

## Features

- ✅ **Automatic conversion** of Polymer 3 components to Lit
- ✅ **Template conversion** from Polymer's HTML templates to Lit's template literals
- ✅ **Property binding conversion** including one-way (`[[]]`) and two-way (`{{}}`) bindings
- ✅ **Event handler conversion** from `on-*` attributes to `@` event listeners
- ✅ **Style handling** with support for custom styles and style includes
- ✅ **DOM manipulation** conversion (`this.$` to `this.renderRoot.querySelector`)
- ✅ **Batch processing** support for entire directories
- ✅ **Configurable output** with Lit 1.x or 2.x support
- ✅ **Error handling** with graceful fallbacks
- ✅ **Debug and verbose modes** for troubleshooting

## Quick Start

### Installation

```bash
cd frontend
npm install
npx tsc
```

### Basic Usage

Convert a single Polymer component:
```bash
node frontend/convert.js my-component.js -out
```

Convert all components in a directory:
```bash
node frontend/convert.js ./src -out
```

### Options

| Option | Description |
|--------|-------------|
| `-1` | Use Lit 1.x imports (`lit-element`) instead of Lit 2.x (`lit`) |
| `-chain` | Enable optional chaining (`?.`) in output |
| `-out` | Add `.out.js` suffix to output files |
| `-v, --verbose` | Show detailed conversion information |
| `-d, --debug` | Show debug output (includes verbose) |
| `-h, --help` | Show help message |

## What Gets Converted

### Templates
```javascript
// Polymer
static get template() {
  return html`<div>[[property]]</div>`;
}

// Lit
render() {
  return html`<div>${this.property}</div>`;
}
```

### Properties & Events
- Property bindings: `[[prop]]` → `${this.prop}`
- Two-way bindings: `{{prop}}` → `${this.prop}` + event handler
- Event handlers: `on-click="handler"` → `@click=${this.handler}`
- DOM access: `this.$.id` → `this.renderRoot.querySelector("#id")`

## Frontend Tool (JavaScript/TypeScript Converter)

The frontend tool is in the `frontend` folder.

### Setup

```bash
cd frontend
npm install
npx tsc
```

### Usage Examples

Convert a single file with output suffix:
```bash
node convert.js my-component.js -out
```

This will convert `my-component.js` into a Lit element and save it as `my-component.js.out.js`

Convert with verbose output:
```bash
node convert.js my-component.js -out -v
```

Get help:
```bash
node convert.js --help
```

## Rewriting Java files

The Java tool is in the `java` folder

To test this tool, do the setup dance once
```
cd java
mvn package
```

Then run it and give it a PolymerTemplate Java file
```
mvn exec:exec -Dfile=/my/project/src/main/java/my/package/MyTemplate.java
```
