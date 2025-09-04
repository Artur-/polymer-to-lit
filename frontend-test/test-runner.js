#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const prettier = require('../frontend/node_modules/prettier');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class TestRunner {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.showDiffs = options.showDiffs !== false;
    this.summary = options.summary || false;
    this.results = {
      passed: [],
      failed: [],
      errors: [],
      total: 0,
      startTime: Date.now()
    };
  }

  log(message, color = '') {
    console.log(`${color}${message}${COLORS.reset}`);
  }

  async formatCode(code) {
    try {
      const config = await prettier.resolveConfig(process.cwd());
      return prettier.format(code, {
        ...config,
        parser: 'babel',
        semi: true,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: 'es5'
      });
    } catch (error) {
      this.log(`Warning: Could not format code: ${error.message}`, COLORS.yellow);
      return code;
    }
  }

  async runSingleTest(inputFile) {
    const testName = path.basename(inputFile, '.js');
    const expectedFile = path.join('expected', `${testName}.js`);
    const outputFile = `${inputFile}.out.js`;
    
    try {
      this.results.total++;
      
      if (this.verbose) {
        this.log(`Running test: ${testName}`, COLORS.cyan);
      }

      // Run the converter
      execSync(`node ../frontend/convert.js "${inputFile}" -out`, {
        stdio: this.verbose ? 'inherit' : 'pipe'
      });

      // Check if output file was created
      if (!fs.existsSync(outputFile)) {
        throw new Error('Converter did not produce output file');
      }

      // Read the files
      let output = fs.readFileSync(outputFile, 'utf8');
      const expected = fs.readFileSync(expectedFile, 'utf8');

      // Format both files with Prettier to ensure consistent comparison
      const formattedOutput = await this.formatCode(output);
      const formattedExpected = await this.formatCode(expected);

      // Write the formatted output back
      fs.writeFileSync(outputFile, formattedOutput);

      // Compare the formatted outputs
      if (formattedOutput === formattedExpected) {
        this.results.passed.push(testName);
        this.log(`✓ ${testName}`, COLORS.green);
        return true;
      } else {
        this.results.failed.push({
          name: testName,
          reason: 'Output does not match expected'
        });
        this.log(`✗ ${testName}`, COLORS.red);
        
        if (this.showDiffs && !this.summary) {
          this.showDiff(formattedOutput, formattedExpected, testName);
        }
        return false;
      }
    } catch (error) {
      this.results.errors.push({
        name: testName,
        error: error.message
      });
      this.log(`✗ ${testName} - Error: ${error.message}`, COLORS.red);
      return false;
    }
  }

  showDiff(actual, expected, testName) {
    try {
      // Use diff command for colored output
      execSync(`diff -u expected/${testName}.js in/${testName}.js.out.js`, {
        stdio: 'inherit'
      });
    } catch (e) {
      // diff returns non-zero exit code when files differ, which is expected
      // The output is already shown via stdio: 'inherit'
    }
  }

  async runAllTests() {
    const inputDir = 'in';
    const files = fs.readdirSync(inputDir)
      .filter(f => f.endsWith('.js') && !f.endsWith('.out.js'))
      .sort();

    this.log(`${COLORS.bright}Running ${files.length} tests...${COLORS.reset}\n`);

    // Clean up old output files
    const outputFiles = fs.readdirSync(inputDir)
      .filter(f => f.endsWith('.out.js'));
    outputFiles.forEach(f => {
      fs.unlinkSync(path.join(inputDir, f));
    });

    // Run all tests
    for (const file of files) {
      await this.runSingleTest(path.join(inputDir, file));
    }

    this.printSummary();
    return this.results.failed.length === 0 && this.results.errors.length === 0;
  }

  printSummary() {
    const duration = ((Date.now() - this.results.startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    this.log('TEST SUMMARY', COLORS.bright);
    console.log('='.repeat(60));
    
    this.log(`Total tests: ${this.results.total}`);
    this.log(`✓ Passed: ${this.results.passed.length}`, COLORS.green);
    
    if (this.results.failed.length > 0) {
      this.log(`✗ Failed: ${this.results.failed.length}`, COLORS.red);
      console.log('\nFailed tests:');
      this.results.failed.forEach(test => {
        this.log(`  - ${test.name}: ${test.reason}`, COLORS.red);
      });
    }
    
    if (this.results.errors.length > 0) {
      this.log(`⚠ Errors: ${this.results.errors.length}`, COLORS.yellow);
      console.log('\nTests with errors:');
      this.results.errors.forEach(test => {
        this.log(`  - ${test.name}: ${test.error}`, COLORS.yellow);
      });
    }
    
    console.log(`\nCompleted in ${duration}s`);
    console.log('='.repeat(60));

    // Write results to JSON file for CI/CD integration
    const jsonResults = {
      ...this.results,
      duration: parseFloat(duration),
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync('test-results.json', JSON.stringify(jsonResults, null, 2));
    
    if (this.verbose) {
      this.log('\nTest results saved to test-results.json', COLORS.cyan);
    }
  }

  async runSpecificTest(testName) {
    const inputFile = path.join('in', `${testName}.js`);
    if (!fs.existsSync(inputFile)) {
      this.log(`Error: Test file '${testName}.js' not found`, COLORS.red);
      return false;
    }

    this.log(`Running test: ${testName}`, COLORS.bright);
    const result = await this.runSingleTest(inputFile);
    
    if (result) {
      this.log(`\n✓ Test passed!`, COLORS.green);
    } else {
      this.log(`\n✗ Test failed!`, COLORS.red);
    }
    
    return result;
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  
  // Check for help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Test Runner for Polymer to Lit Converter

Usage:
  node test-runner.js [options] [test-name]

Options:
  --verbose, -v      Show detailed output
  --no-diff          Don't show diffs for failed tests
  --summary, -s      Show only summary (no individual test output)
  --help, -h         Show this help message

Examples:
  node test-runner.js                    # Run all tests
  node test-runner.js dom-if             # Run specific test
  node test-runner.js --verbose          # Run all tests with verbose output
  node test-runner.js --summary          # Show only summary
  node test-runner.js --no-diff dom-if   # Run test without showing diff
`);
    process.exit(0);
  }
  
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    showDiffs: !args.includes('--no-diff'),
    summary: args.includes('--summary') || args.includes('-s')
  };

  const runner = new TestRunner(options);

  // Override log method if summary mode
  if (options.summary && !options.verbose) {
    const originalLog = runner.log.bind(runner);
    runner.log = (message, color) => {
      // Only show the summary section
      if (message.includes('SUMMARY') || message.includes('=====') || 
          message.includes('Total') || message.includes('Passed') || 
          message.includes('Failed') || message.includes('Errors') ||
          message.includes('Completed') || message.includes('tests with')) {
        originalLog(message, color);
      }
    };
  }

  // Check for specific test
  const testArg = args.find(arg => !arg.startsWith('-'));
  
  try {
    if (testArg) {
      // Run specific test
      const testName = testArg.replace('.js', '');
      const success = await runner.runSpecificTest(testName);
      process.exit(success ? 0 : 1);
    } else {
      // Run all tests
      const success = await runner.runAllTests();
      process.exit(success ? 0 : 1);
    }
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TestRunner;