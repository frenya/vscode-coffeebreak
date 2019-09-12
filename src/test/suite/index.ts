'use strict';

import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

import * as mocks from './mocks';
import { CoverageRunner } from './coverage';

const coverOptions = require('../../../coverconfig.json');

// Linux: prevent a weird NPE when mocha on Linux requires the window size from the TTY
// Since we are not running in a tty environment, we just implementt he method statically
const tty = require('tty');
if (!tty.getWindowSize) {
    tty.getWindowSize = (): number[] => {
        return [80, 75];
    };
}

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
	});
	mocha.useColors(true);

	const testsRoot = path.resolve(__dirname, '..');

  // Setup coverage pre-test, including post-test hook to report
  const coverageRunner = (coverOptions && coverOptions.enabled) ? new CoverageRunner(coverOptions, testsRoot) : null;
  if (coverageRunner) coverageRunner.setupCoverage();

  return new Promise((c, e) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err);
      }

      // Register all mocks
      mocks.setUp();

      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run(failures => {
          mocks.tearDown();
          // Report coverage results
          if (coverageRunner) coverageRunner.reportCoverage();
          else console.warn('No coverage runner');

          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        mocks.tearDown();
        e(err);
      }
    });
  });
}
