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

## Installation

1. Clone the repository
2. Install dependencies:
```bash
cd frontend
npm install
```

3. Compile the TypeScript source:
```bash
npx tsc
```

## Usage

### Basic Usage

Convert a single Polymer component:
```bash
node convert.js my-component.js -out
```

Convert all components in a directory:
```bash
node convert.js ./src -out
```

### Options

| Option | Description |
|--------|-------------|
| `-1` | Use Lit 1.x imports (`lit-element`) instead of Lit 2.x (`lit`) |
| `-chain` | Enable optional chaining (`?.`) in output for null-safe property access |
| `-out` | Add `.out.js` suffix to output files (prevents overwriting source files) |
| `-v, --verbose` | Show detailed conversion information |
| `-d, --debug` | Show debug output (includes verbose) |
| `-h, --help` | Show help message |

### Examples

Convert with Lit 1.x compatibility:
```bash
node convert.js my-component.js -1 -out
```

Convert with optional chaining enabled:
```bash
node convert.js my-component.js -chain -out
```

Debug conversion issues:
```bash
node convert.js problematic-component.js --debug -out
```

Batch convert with verbose output:
```bash
node convert.js ./src --verbose
```

## What Gets Converted

### Class Declaration
```javascript
// Polymer
class MyElement extends PolymerElement { ... }

// Lit
class MyElement extends LitElement { ... }
```

### Templates
```javascript
// Polymer
static get template() {
  return html`
    <div>[[property]]</div>
    <button on-click="handleClick">Click</button>
  `;
}

// Lit
render() {
  return html`
    <div>${this.property}</div>
    <button @click=${this.handleClick}>Click</button>
  `;
}
```

### Properties
```javascript
// Polymer
static get properties() {
  return {
    myProp: {
      type: String,
      value: 'default',
      reflectToAttribute: true
    }
  };
}

// Lit
static get properties() {
  return {
    myProp: {
      type: String,
      reflect: true
    }
  };
}
// Plus constructor initialization for default values
```

### Lifecycle Methods
```javascript
// Polymer
ready() {
  super.ready();
  // initialization
}

// Lit
firstUpdated(_changedProperties) {
  super.firstUpdated(_changedProperties);
  // initialization
}
```

### DOM Access
```javascript
// Polymer
this.$.elementId
this.$['element-id']

// Lit
this.renderRoot.querySelector("#elementId")
this.renderRoot.querySelector("#element-id")
```

## Supported Polymer Features

### ✅ Fully Supported
- Basic class conversion
- Template literals and HTML templates
- Property declarations
- One-way data bindings (`[[property]]`)
- Two-way data bindings (`{{property}}`)
- Event handlers (`on-click`, etc.)
- Computed properties
- Property observers
- DOM element references (`this.$`)
- Style modules and includes
- `dom-if` and `dom-repeat` templates

### ⚠️ Partial Support
- Complex observers (marked with TODO comments)
- Custom mixins (basic support, may need manual review)
- Vaadin Grid column renderers

### ❌ Not Supported (Requires Manual Conversion)
- Polymer-specific behaviors
- Legacy element syntax
- Some complex template expressions
- Custom property effects

## Error Handling

The converter includes comprehensive error handling:

- **Input validation**: Checks file existence, type, and format
- **Parse errors**: Gracefully handles malformed JavaScript
- **Template errors**: Falls back to original HTML if parsing fails
- **Output errors**: Writes unformatted code if Prettier fails

## Debugging

Use verbose mode to see conversion details:
```bash
node convert.js my-component.js -v -out
```

Use debug mode for comprehensive output:
```bash
node convert.js my-component.js -d -out
```

Debug output includes:
- File sizes and processing steps
- Property and method detection
- Template transformation details
- Expression resolution information
- AST node processing

## Limitations

1. **Manual Review Required**: Always review converted code, especially for complex components
2. **Test Coverage**: Converted components should be thoroughly tested
3. **Custom Patterns**: Non-standard Polymer patterns may not convert correctly
4. **Formatting**: Output formatting depends on Prettier; malformed input may affect output

## Troubleshooting

### Common Issues

**Issue**: Conversion fails with parsing error
- **Solution**: Check that the input file is valid JavaScript. Use debug mode to identify the problematic code.

**Issue**: Template bindings not converted correctly
- **Solution**: Complex expressions may need manual adjustment. Check for nested bindings or custom functions.

**Issue**: Properties not initialized
- **Solution**: Default values from Polymer properties are moved to the constructor. Verify initialization order.

**Issue**: Styles not applied
- **Solution**: Style modules require manual setup in Lit. Check that style includes are properly imported.

## Contributing

Contributions are welcome! Please:
1. Test your changes thoroughly
2. Update documentation as needed
3. Follow the existing code style
4. Add debug logging for new features

## License

[Add your license information here]

## Support

For issues, feature requests, or questions:
- Create an issue in the repository
- Check existing issues for solutions
- Use debug mode to gather diagnostic information